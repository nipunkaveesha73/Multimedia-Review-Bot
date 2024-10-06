// Use environment variables or placeholders for sensitive information
const TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';  // Replace with your bot token
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID || 'ADMIN_GROUP_ID';  // Replace with admin group chat ID
const MAIN_GROUP_ID = process.env.MAIN_GROUP_ID || 'MAIN_GROUP_ID';  // Replace with the main group chat ID
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const data = await request.json();
  console.log('Received data:', JSON.stringify(data));

  if (data.message) {
    const chatId = data.message.chat.id;
    const messageId = data.message.message_id;
    const username = data.message.from.username ? `@${data.message.from.username}` : data.message.from.first_name;
    const text = data.message.text;
    console.log('Original message username:', username);

    if (data.message.text && data.message.text.startsWith('/submitmedia')) {
      await handleSubmitMediaCommand(chatId);
    } else if (text && text.startsWith('/sendmsg') && chatId == ADMIN_GROUP_ID) {
      await handleSendMsgCommand(text);
    } else if ((data.message.photo || data.message.video || data.message.document) && chatId.toString() !== MAIN_GROUP_ID) {
      // User sends media
      const caption = data.message.caption || '';
      const media = data.message.photo || data.message.video || data.message.document;
      const fileId = Array.isArray(media) ? media[media.length - 1].file_id : media.file_id;

      await forwardToAdminGroup(chatId, messageId, fileId, caption, username);
    } else if (text && chatId.toString() !== MAIN_GROUP_ID) {
      // User sends a text message
      await forwardTextToAdminGroup(username, chatId, text);
    } 
  } else if (data.callback_query) {
    // Admin clicks inline button
    console.log('Callback query data:', JSON.stringify(data.callback_query));
    const callbackData = data.callback_query.data;
    const messageId = data.callback_query.message.message_id;
    const chatId = data.callback_query.message.chat.id;
    const originalCaption = data.callback_query.message.caption;
    console.log('Original caption:', originalCaption);
    const originalUser = originalCaption.split("Posted by: ")[1];
    console.log('Extracted original user:', originalUser);

    if (callbackData === 'good') {
      // Forward to main group
      await forwardToMainGroup(chatId, messageId, originalUser);
      await deleteMessage(chatId, messageId);
    } else if (callbackData === 'not_good') {
      // Delete from admin group
      await deleteMessage(chatId, messageId);
    }

    // Answer callback query
    await answerCallbackQuery(data.callback_query.id);
  }

  return new Response('OK', { status: 200 });
}

async function forwardTextToAdminGroup(username, userId, text) {
  const formattedMessage = `${username}(${userId}) - ${text}`;

  const payload = {
    chat_id: ADMIN_GROUP_ID,
    text: formattedMessage
  };

  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const responseData = await response.json();
  console.log('Admin group text forward response:', JSON.stringify(responseData));
}


async function handleSendMsgCommand(text) {
  const parts = text.split(' ');
  if (parts.length < 3) {
    console.log('Invalid /sendmsg command. Usage: /sendmsg userId message');
    return;
  }

  const userId = parts[1];
  const message = parts.slice(2).join(' ');

  await sendMessageToUser(userId, message);
}
async function sendMessageToUser(userId, message) {
  const payload = {
    chat_id: userId,
    text: message,
    parse_mode: 'Markdown'
  };

  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();
  console.log('Message sent to user:', JSON.stringify(responseData));
}

async function handleSubmitMediaCommand(chatId) {
  const message = "Want to post media in the main group? Click the button below to send your media for admin review.";
  const inlineKeyboard = {
    inline_keyboard: [[
      { text: "Send Media", url: `https://t.me/media_review_bot` }
    ]]
  };

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
    reply_markup: JSON.stringify(inlineKeyboard)
  };

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function forwardToAdminGroup(chatId, messageId, fileId, caption, username) {
  console.log('Forwarding to admin group. Username:', username);
  const buttons = {
    inline_keyboard: [[
      { text: 'Good', callback_data: 'good' },
      { text: 'Not Good', callback_data: 'not_good' }
    ]]
  };

  const payload = {
    chat_id: ADMIN_GROUP_ID,
    from_chat_id: chatId,
    message_id: messageId,
    caption: `ID: ${chatId}\ncaption: ${caption}\nPosted by: ${username}`,
    reply_markup: JSON.stringify(buttons)
  };

  console.log('Admin group payload:', JSON.stringify(payload));

  const response = await fetch(`${TELEGRAM_API}/copyMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const responseData = await response.json();
  console.log('Admin group forward response:', JSON.stringify(responseData));
}

async function forwardToMainGroup(chatId, messageId, originalUser) {
  console.log('Forwarding to main group. Original user:', originalUser);
  const payload = {
    chat_id: MAIN_GROUP_ID,
    from_chat_id: chatId,
    message_id: messageId,
    caption: `Posted by ${originalUser}`
  };

  console.log('Main group payload:', JSON.stringify(payload));

  const response = await fetch(`${TELEGRAM_API}/copyMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const responseData = await response.json();
  console.log('Main group forward response:', JSON.stringify(responseData));
}

async function deleteMessage(chatId, messageId) {
  const payload = {
    chat_id: chatId,
    message_id: messageId
  };

  await fetch(`${TELEGRAM_API}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function answerCallbackQuery(callbackQueryId) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId
    })
  });
}
