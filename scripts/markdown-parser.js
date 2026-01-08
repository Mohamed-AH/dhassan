const fs = require('fs');

/**
 * Parse markdown file and extract structured data
 */
class MarkdownParser {
  constructor(filePathOrContent, isRawContent = false) {
    if (isRawContent) {
      this.filePath = null;
      this.content = filePathOrContent;
      this.lines = this.content.split('\n');
    } else {
      this.filePath = filePathOrContent;
      this.content = '';
      this.lines = [];
    }
  }

  /**
   * Read markdown file
   */
  readFile() {
    if (!this.filePath) {
      // Content already loaded, skip file reading
      return this;
    }
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }
    this.content = fs.readFileSync(this.filePath, 'utf-8');
    this.lines = this.content.split('\n');
    return this;
  }

  /**
   * Extract all chapter headings (## format)
   */
  extractChapters() {
    const chapters = [];
    const chapterRegex = /^##\s+(.+)$/;

    this.lines.forEach(line => {
      const match = line.match(chapterRegex);
      if (match) {
        chapters.push(match[1].trim());
      }
    });

    return chapters;
  }

  /**
   * Extract timestamps in format (HH:MM:SS-HH:MM:SS) or (MM:SS-MM:SS)
   */
  extractTimestamps() {
    const timestamps = [];
    const timestampRegex = /\((\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?)\)/g;

    this.lines.forEach((line, index) => {
      let match;
      while ((match = timestampRegex.exec(line)) !== null) {
        const startTime = match[1];
        const endTime = match[2];

        // Get context around timestamp (next 100 chars)
        const textSnippet = line.replace(match[0], '').trim().substring(0, 100);

        // Find the chapter this timestamp belongs to
        let description = textSnippet || 'Section';

        // Look for heading above this line
        for (let i = index; i >= 0; i--) {
          if (this.lines[i].startsWith('##')) {
            description = this.lines[i].replace(/^##\s+/, '').trim();
            break;
          }
        }

        timestamps.push({
          time: startTime,
          endTime: endTime,
          seconds: this.timeToSeconds(startTime),
          endSeconds: this.timeToSeconds(endTime),
          description: description,
          textSnippet: textSnippet,
          lineNumber: index + 1
        });
      }
    });

    return timestamps;
  }

  /**
   * Detect hadith range by finding all hadith mentions
   */
  detectHadithRange() {
    const hadithNumbers = new Set();

    // Arabic number words to digits
    const arabicNumbers = {
      'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5,
      'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9, 'العاشر': 10
    };

    this.lines.forEach(line => {
      // Match "Hadith 1:" or "## Hadith 1"
      const englishMatch = line.match(/(?:Hadith|hadith)\s+(\d+)/i);
      if (englishMatch) {
        hadithNumbers.add(parseInt(englishMatch[1]));
      }

      // Match "الحديث الأول" or "الحديث 1"
      const arabicMatch = line.match(/الحديث\s+(الأول|الثاني|الثالث|\d+)/);
      if (arabicMatch) {
        const num = arabicNumbers[arabicMatch[1]] || parseInt(arabicMatch[1]);
        if (num) hadithNumbers.add(num);
      }
    });

    if (hadithNumbers.size === 0) {
      return null;
    }

    const sorted = Array.from(hadithNumbers).sort((a, b) => a - b);
    return {
      start: sorted[0],
      end: sorted[sorted.length - 1],
      detected: sorted
    };
  }

  /**
   * Extract key terms from bold text (**term**)
   */
  extractKeyTerms() {
    const keyTerms = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const seenTerms = new Set();

    this.lines.forEach((line, index) => {
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        const term = match[1].trim();

        // Skip if already seen or if it's just formatting (too short/common)
        if (seenTerms.has(term) || term.length < 3) continue;

        // Extract Arabic term if present in parentheses
        const arabicMatch = term.match(/\(([^\)]+)\)/);
        let termEnglish = term;
        let termArabic = null;

        if (arabicMatch && this.hasArabic(arabicMatch[1])) {
          termArabic = arabicMatch[1];
          termEnglish = term.replace(arabicMatch[0], '').trim();
        }

        // Get definition (rest of line + next line if needed)
        let definition = line.substring(match.index + match[0].length).trim();
        if (definition.length < 20 && index + 1 < this.lines.length) {
          definition += ' ' + this.lines[index + 1].trim();
        }
        definition = definition.substring(0, 200); // Limit length

        keyTerms.push({
          termEnglish,
          termArabic,
          definition: definition || 'No definition provided',
          firstMention: index + 1
        });

        seenTerms.add(term);
      }
    });

    return keyTerms;
  }

  /**
   * Get file statistics
   */
  getStats() {
    return {
      totalLines: this.lines.length,
      totalWords: this.content.split(/\s+/).length,
      totalCharacters: this.content.length
    };
  }

  /**
   * Convert time string to seconds
   */
  timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  }

  /**
   * Check if string contains Arabic characters
   */
  hasArabic(str) {
    return /[\u0600-\u06FF]/.test(str);
  }

  /**
   * Parse all data at once
   */
  parseAll() {
    this.readFile();

    return {
      chapters: this.extractChapters(),
      timestamps: this.extractTimestamps(),
      hadithRange: this.detectHadithRange(),
      keyTerms: this.extractKeyTerms(),
      stats: this.getStats(),
      fullContent: this.content,
      fileName: this.filePath ? this.filePath.split('/').pop() : 'raw-content'
    };
  }
}

module.exports = MarkdownParser;
