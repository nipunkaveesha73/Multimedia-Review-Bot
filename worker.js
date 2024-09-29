const TOKEN = 'YOUR_BOT_TOKEN_HERE';  // Replace with your bot token
const ADMIN_GROUP_ID = 'YOUR_ADMIN_GROUP_CHAT_ID';  // Replace with admin group chat ID
const MAIN_GROUP_ID = 'YOUR_MAIN_GROUP_CHAT_ID';  // Replace with the main group chat ID
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
    console.log('Original message username:', username);
    
    if (data.message.text && data.message.text.startsWith('/submitmedia')) {
      await handleSubmitMediaCommand(chatId);
    } else if (data.message.photo || data.message.video || data.message.document) {
      // User sends media
      const caption = data.message.caption || '';
      const media = data.message.photo || data.message.video || data.message.document;
      const fileId = Array.isArray(media) ? media[media.length - 1].file_id : media.file_id;

      await forwardToAdminGroup(chatId, messageId, fileId, caption, username);
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

async function handleSubmitMediaCommand(chatId) {
  const message = "Want to post media in MONTISOORIYA💀❤️? Click the button below to send your media for admin review.";
  const inlineKeyboard = {
    inline_keyboard: [[
      { text: "Send Media", url: `https://t.me/YOUR_BOT_USERNAME` }
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
    caption: `${caption}\n\nPosted by: ${username}`,
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
