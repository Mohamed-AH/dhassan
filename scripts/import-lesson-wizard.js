const inquirer = require('inquirer').default;
const slugify = require('slugify');
const chalk = require('chalk');
const ora = require('ora');
const { MongoClient } = require('mongodb');
const path = require('path');
const MarkdownParser = require('./markdown-parser');
const validators = require('./validators');
require('dotenv').config();

/**
 * Convert English numerals to Arabic-Indic numerals
 */
function toArabicNumerals(num) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, d => arabicNumerals[d]);
}

/**
 * Convert Hijri date to Gregorian (basic approximation)
 * Note: This is a simple approximation. For production, use a proper Hijri calendar library
 */
function hijriToGregorian(hijriDateStr) {
  // Parse Hijri date
  const normalized = hijriDateStr.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const parts = normalized.split('/').map(s => parseInt(s.trim()));

  if (parts.length !== 3) {
    // Default to today if parsing fails
    return new Date();
  }

  const [day, month, year] = parts;

  // Simple conversion: Hijri year 1447 ≈ Gregorian 2025-2026
  // This is approximate! For exact conversion, use a proper library
  const gregorianYear = Math.floor(year / 1.03) + 622;
  const gregorianMonth = month - 1; // 0-indexed for Date

  return new Date(gregorianYear, gregorianMonth, day);
}

/**
 * Generate a unique slug from text
 */
function generateSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

/**
 * Display logo and title
 */
function displayHeader() {
  console.clear();
  console.log(chalk.bold.green('\n📚 Lesson Import Wizard'));
  console.log(chalk.gray('━'.repeat(60)));
  console.log();
}

/**
 * Main import wizard function
 */
async function importLessonWizard() {
  displayHeader();

  // Get markdown file path from command line argument
  const markdownFile = process.argv[2];

  if (!markdownFile) {
    console.log(chalk.red('❌ Error: Please provide a markdown file path'));
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.gray('  npm run import-lesson <path-to-markdown-file>'));
    console.log(chalk.gray('  npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md'));
    console.log();
    process.exit(1);
  }

  // Resolve full path
  const filePath = path.resolve(process.cwd(), markdownFile);

  // Step 1: Parse markdown file
  console.log(chalk.cyan('Step 1: Reading Markdown File...'));
  const spinner = ora('Parsing markdown...').start();

  let parsedData;
  try {
    const parser = new MarkdownParser(filePath);
    parsedData = parser.parseAll();
    spinner.succeed(chalk.green('✅ Markdown parsed successfully'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to parse markdown'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }

  // Display auto-extracted data
  console.log();
  console.log(chalk.cyan('Step 2: Auto-Extracted Content:'));
  console.log(chalk.gray('  File:'), chalk.white(parsedData.fileName));
  console.log(chalk.gray('  Size:'), chalk.white(`${parsedData.stats.totalLines} lines (~${Math.round(parsedData.stats.totalWords / 1000)}k words)`));
  console.log(chalk.gray('  Chapters:'), chalk.white(`${parsedData.chapters.length} sections`));
  console.log(chalk.gray('  Timestamps:'), chalk.white(`${parsedData.timestamps.length} timestamps`));

  if (parsedData.hadithRange) {
    console.log(chalk.gray('  Hadiths:'), chalk.green(`Detected ${parsedData.hadithRange.start}-${parsedData.hadithRange.end} (${parsedData.hadithRange.detected.length} hadiths)`));
  } else {
    console.log(chalk.gray('  Hadiths:'), chalk.yellow('Not detected (will ask manually)'));
  }

  console.log(chalk.gray('  Key Terms:'), chalk.white(`${parsedData.keyTerms.length} terms`));
  console.log();

  // Step 3: Collect metadata through interactive prompts
  console.log(chalk.cyan('Step 3: Collecting Metadata...'));
  console.log(chalk.gray('Please answer the following questions:'));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'seriesTitle',
      message: 'Series Title (English):',
      default: 'Sahih Al-Bukhari - Book of Knowledge/Faith',
      validate: (input) => validators.validateRequired(input, 'Series title').valid || validators.validateRequired(input, 'Series title').error
    },
    {
      type: 'input',
      name: 'seriesTitleArabic',
      message: 'Series Title (Arabic):',
      default: 'صحيح البخاري - كتاب العلم',
      validate: (input) => validators.validateRequired(input, 'Arabic series title').valid || validators.validateRequired(input, 'Arabic series title').error
    },
    {
      type: 'input',
      name: 'sheikhName',
      message: 'Sheikh Name (English):',
      default: 'Hassan bin Muhammad Mansour Al-Daghriri',
      validate: (input) => validators.validateRequired(input, 'Sheikh name').valid || validators.validateRequired(input, 'Sheikh name').error
    },
    {
      type: 'input',
      name: 'sheikhNameArabic',
      message: 'Sheikh Name (Arabic):',
      default: 'حسن بن محمد منصور الدغريري',
      validate: (input) => validators.validateRequired(input, 'Arabic sheikh name').valid || validators.validateRequired(input, 'Arabic sheikh name').error
    },
    {
      type: 'number',
      name: 'lessonNumber',
      message: 'Lesson Number:',
      default: 1,
      validate: (input) => {
        const result = validators.validateLessonNumber(input);
        return result.valid || result.error;
      }
    },
    {
      type: 'input',
      name: 'lessonTitle',
      message: 'Lesson Title:',
      default: 'First Lesson',
      validate: (input) => validators.validateRequired(input, 'Lesson title').valid || validators.validateRequired(input, 'Lesson title').error
    },
    {
      type: 'number',
      name: 'hadithsStart',
      message: parsedData.hadithRange
        ? `Hadiths - Start Number (detected: ${parsedData.hadithRange.start}):`
        : 'Hadiths - Start Number:',
      default: parsedData.hadithRange ? parsedData.hadithRange.start : 1,
      validate: (input) => {
        const result = validators.validateHadithNumber(input);
        return result.valid || result.error;
      }
    },
    {
      type: 'number',
      name: 'hadithsEnd',
      message: parsedData.hadithRange
        ? `Hadiths - End Number (detected: ${parsedData.hadithRange.end}):`
        : 'Hadiths - End Number:',
      default: parsedData.hadithRange ? parsedData.hadithRange.end : 30,
      validate: (input, answers) => {
        const result = validators.validateHadithNumber(input);
        if (!result.valid) return result.error;

        const rangeResult = validators.validateHadithRange(answers.hadithsStart, input);
        return rangeResult.valid || rangeResult.error;
      }
    },
    {
      type: 'input',
      name: 'duration',
      message: 'Duration (HH:MM:SS or MM:SS):',
      default: '1:07:19',
      validate: (input) => {
        const result = validators.validateDuration(input);
        return result.valid || result.error;
      }
    },
    {
      type: 'input',
      name: 'location',
      message: 'Location:',
      default: 'Al-Wurood Mosque',
      validate: (input) => validators.validateRequired(input, 'Location').valid || validators.validateRequired(input, 'Location').error
    },
    {
      type: 'input',
      name: 'dateHijri',
      message: 'Date (Hijri, format: DD/MM/YYYY):',
      default: '١٣/ ٧/ ١٤٤٧',
      validate: (input) => {
        const result = validators.validateHijriDate(input);
        return result.valid || result.error;
      }
    },
    {
      type: 'input',
      name: 'telegramLink',
      message: 'Telegram Audio Link:',
      default: 'https://t.me/daririhasan/6158',
      validate: (input) => {
        if (!input) return true; // Optional
        const result = validators.validateURL(input);
        return result.valid || result.error;
      }
    }
  ]);

  // Step 4: Generate derived data
  console.log();
  console.log(chalk.cyan('Step 4: Generating Lesson Data...'));

  const seriesId = generateSlug(answers.seriesTitle);
  const lessonId = `${seriesId}-lesson-${String(answers.lessonNumber).padStart(2, '0')}`;

  // Generate hadith display text (bilingual)
  const hadithsDisplayEn = `Hadith ${answers.hadithsStart}-${answers.hadithsEnd}`;
  const hadithsDisplayAr = `أحاديث ${toArabicNumerals(answers.hadithsStart)}-${toArabicNumerals(answers.hadithsEnd)}`;
  const hadithsDisplay = `${hadithsDisplayEn} | ${hadithsDisplayAr}`;

  // Generate hadith array
  const hadithsArray = [];
  for (let i = answers.hadithsStart; i <= answers.hadithsEnd; i++) {
    hadithsArray.push(i);
  }

  // Convert Hijri to Gregorian
  const dateGregorian = hijriToGregorian(answers.dateHijri);

  // Parse duration to seconds
  const durationResult = validators.validateDuration(answers.duration);
  const durationSeconds = durationResult.seconds;

  // Build complete lesson document
  const lessonDocument = {
    // Basic Info
    seriesId,
    seriesTitle: answers.seriesTitle,
    seriesTitleArabic: answers.seriesTitleArabic,

    sheikhName: answers.sheikhName,
    sheikhNameArabic: answers.sheikhNameArabic,

    lessonNumber: answers.lessonNumber,
    lessonTitle: answers.lessonTitle,
    lessonId,

    // Hadiths
    hadithsStart: answers.hadithsStart,
    hadithsEnd: answers.hadithsEnd,
    hadithsArray,
    hadithsDisplay,

    // Audio
    duration: answers.duration,
    durationSeconds,
    telegramLink: answers.telegramLink || null,

    // Location & Date
    location: answers.location,
    dateHijri: answers.dateHijri,
    dateGregorian,

    // Content
    notesFile: parsedData.fileName,
    notes: parsedData.fullContent,
    notesWordCount: parsedData.stats.totalWords,

    // Auto-Extracted
    chapters: parsedData.chapters,
    timestamps: parsedData.timestamps,
    keyTerms: parsedData.keyTerms,

    // Metadata
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Step 5: Display preview
  console.log();
  console.log(chalk.cyan('━'.repeat(60)));
  console.log(chalk.bold.cyan('📋 LESSON DATA PREVIEW'));
  console.log(chalk.cyan('━'.repeat(60)));
  console.log();

  console.log(chalk.bold('BASIC INFO:'));
  console.log(chalk.gray('  Series:'), chalk.white(answers.seriesTitle));
  console.log(chalk.gray('         '), chalk.white(answers.seriesTitleArabic));
  console.log(chalk.gray('  Sheikh:'), chalk.white(answers.sheikhName));
  console.log(chalk.gray('         '), chalk.white(answers.sheikhNameArabic));
  console.log(chalk.gray('  Lesson:'), chalk.white(`#${answers.lessonNumber} - ${answers.lessonTitle}`));
  console.log();

  console.log(chalk.bold('HADITHS:'));
  console.log(chalk.gray('  Range:'), chalk.green(hadithsDisplay));
  console.log(chalk.gray('  Count:'), chalk.white(`${hadithsArray.length} hadiths`));
  console.log();

  console.log(chalk.bold('AUDIO:'));
  console.log(chalk.gray('  Duration:'), chalk.white(`${answers.duration} (${durationSeconds.toLocaleString()} seconds)`));
  if (answers.telegramLink) {
    console.log(chalk.gray('  Telegram:'), chalk.blue(answers.telegramLink));
  }
  console.log();

  console.log(chalk.bold('DATE & LOCATION:'));
  console.log(chalk.gray('  Location:'), chalk.white(answers.location));
  console.log(chalk.gray('  Date (Hijri):'), chalk.white(answers.dateHijri));
  console.log(chalk.gray('  Date (Gregorian):'), chalk.white(dateGregorian.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })));
  console.log();

  console.log(chalk.bold('CONTENT:'));
  console.log(chalk.gray('  Notes:'), chalk.white(`${parsedData.stats.totalLines} lines (~${Math.round(parsedData.stats.totalWords / 1000)}k words)`));
  console.log(chalk.gray('  Chapters:'), chalk.white(`${parsedData.chapters.length} sections`));
  console.log(chalk.gray('  Timestamps:'), chalk.white(`${parsedData.timestamps.length} timestamps`));
  console.log(chalk.gray('  Key Terms:'), chalk.white(`${parsedData.keyTerms.length} terms`));
  console.log();

  console.log(chalk.bold('GENERATED IDs:'));
  console.log(chalk.gray('  Series ID:'), chalk.cyan(seriesId));
  console.log(chalk.gray('  Lesson ID:'), chalk.cyan(lessonId));
  console.log();

  console.log(chalk.cyan('━'.repeat(60)));

  // Step 6: Confirm import
  const { confirmImport } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmImport',
      message: 'Import this lesson to database?',
      default: true
    }
  ]);

  if (!confirmImport) {
    console.log(chalk.yellow('\n❌ Import cancelled'));
    process.exit(0);
  }

  // Step 7: Import to MongoDB
  console.log();
  console.log(chalk.cyan('Step 5: Importing to Database...'));
  const dbSpinner = ora('Connecting to MongoDB...').start();

  let client;
  try {
    client = new MongoClient(process.env.DB_STRING);
    await client.connect();
    dbSpinner.text = 'Connected. Importing lesson...';

    const db = client.db('notes-from-majlis');
    const lessonsCollection = db.collection('lessons');

    // Check for duplicates
    const existing = await lessonsCollection.findOne({
      seriesId,
      lessonNumber: answers.lessonNumber
    });

    if (existing) {
      dbSpinner.warn(chalk.yellow('⚠️  Lesson already exists'));
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Overwrite existing lesson?',
          default: false
        }
      ]);

      if (!overwrite) {
        dbSpinner.fail(chalk.yellow('Import cancelled'));
        await client.close();
        process.exit(0);
      }

      // Update existing
      await lessonsCollection.updateOne(
        { _id: existing._id },
        { $set: { ...lessonDocument, updatedAt: new Date() } }
      );
      dbSpinner.succeed(chalk.green('✅ Lesson updated successfully!'));
    } else {
      // Insert new
      const result = await lessonsCollection.insertOne(lessonDocument);
      dbSpinner.succeed(chalk.green('✅ Lesson imported successfully!'));
      console.log(chalk.gray('   Lesson ID:'), chalk.cyan(result.insertedId));
    }

    // Also create/update series document
    const seriesCollection = db.collection('series');
    const existingSeries = await seriesCollection.findOne({ seriesId });

    if (!existingSeries) {
      await seriesCollection.insertOne({
        seriesId,
        titleEnglish: answers.seriesTitle,
        titleArabic: answers.seriesTitleArabic,
        category: 'Hadith', // Default, can be updated later
        author: answers.sheikhName,
        status: 'Ongoing',
        totalLessons: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(chalk.gray('   ✅ Series created'));
    } else {
      // Update lesson count
      const lessonCount = await lessonsCollection.countDocuments({ seriesId });
      await seriesCollection.updateOne(
        { seriesId },
        {
          $set: {
            totalLessons: lessonCount,
            updatedAt: new Date()
          }
        }
      );
      console.log(chalk.gray('   ✅ Series updated'));
    }

    await client.close();

    // Success!
    console.log();
    console.log(chalk.green.bold('🎉 Import Complete!'));
    console.log();
    console.log(chalk.gray('You can now view this lesson at:'));
    console.log(chalk.blue(`http://localhost:3000/series/${seriesId}`));
    console.log();

  } catch (error) {
    if (dbSpinner.isSpinning) {
      dbSpinner.fail(chalk.red('❌ Database error'));
    }
    console.error(chalk.red('\nError:'), error.message);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

// Run the wizard
importLessonWizard().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
