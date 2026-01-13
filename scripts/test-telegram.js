/**
 * Test script to verify Telegram Bot credentials
 * Usage: node scripts/test-telegram.js
 */

require('dotenv').config();

async function testTelegramBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log('\n🔍 Testing Telegram Bot Configuration...\n');

  // Check if credentials exist
  if (!botToken || botToken === 'your_telegram_bot_token_here') {
    console.error('❌ TELEGRAM_BOT_TOKEN not set in .env file');
    console.log('\n📝 To fix:');
    console.log('1. Message @BotFather on Telegram');
    console.log('2. Create a new bot with /newbot');
    console.log('3. Copy the token to your .env file\n');
    return;
  }

  if (!chatId || chatId === 'your_telegram_chat_id_here') {
    console.error('❌ TELEGRAM_CHAT_ID not set in .env file');
    console.log('\n📝 To fix:');
    console.log('1. Start a chat with your bot on Telegram');
    console.log('2. Send any message to it');
    console.log(`3. Visit: https://api.telegram.org/bot${botToken}/getUpdates`);
    console.log('4. Find "chat":{"id":YOUR_CHAT_ID}');
    console.log('5. Copy that ID to your .env file\n');
    return;
  }

  console.log('✅ Bot Token found:', botToken.substring(0, 10) + '...');
  console.log('✅ Chat ID found:', chatId);
  console.log('');

  // Test 1: Check bot token is valid
  console.log('📡 Test 1: Checking if bot token is valid...');
  try {
    const meResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meResponse.json();

    if (meData.ok) {
      console.log(`✅ Bot token is valid! Bot name: @${meData.result.username}`);
    } else {
      console.error('❌ Bot token is invalid:', meData.description);
      return;
    }
  } catch (error) {
    console.error('❌ Error checking bot token:', error.message);
    return;
  }

  // Test 2: Check if chat exists
  console.log('\n📡 Test 2: Checking if chat ID is valid...');
  try {
    const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
    const chatData = await chatResponse.json();

    if (chatData.ok) {
      console.log('✅ Chat ID is valid!');
      console.log('   Chat type:', chatData.result.type);
      if (chatData.result.username) {
        console.log('   Username:', chatData.result.username);
      }
      if (chatData.result.first_name) {
        console.log('   Name:', chatData.result.first_name);
      }
    } else {
      console.error('❌ Chat ID is invalid:', chatData.description);
      console.log('\n📝 To fix:');
      console.log('1. Make sure you started a conversation with your bot');
      console.log('2. Send /start or any message to the bot first');
      console.log(`3. Then visit: https://api.telegram.org/bot${botToken}/getUpdates`);
      console.log('4. Look for the correct chat ID\n');
      return;
    }
  } catch (error) {
    console.error('❌ Error checking chat:', error.message);
    return;
  }

  // Test 3: Send a test message
  console.log('\n📡 Test 3: Sending test message...');
  try {
    const testMessage = '🧪 Test message from dhassan app\n\nIf you see this, your Telegram integration is working correctly!';

    const sendResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown'
      })
    });

    const sendData = await sendResponse.json();

    if (sendData.ok) {
      console.log('✅ Test message sent successfully!');
      console.log('   Check your Telegram to confirm you received it.');
    } else {
      console.error('❌ Failed to send test message:', sendData.description);
    }
  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
    return;
  }

  console.log('\n✨ All tests passed! Your Telegram integration is ready to use.\n');
}

testTelegramBot();
