```markdown
# Media Review Telegram Bot

This is a Telegram bot that facilitates media submission and review by admins before posting to the main group. Users can submit media, which is forwarded to the admin group for approval. Admins can choose to accept or reject the media using inline buttons. If approved, the media is forwarded to the main group along with a mention of the original submitter.

## Features

- **Submit Media**: Users can submit media for admin review by typing `/submitmedia`. The bot responds with a button to direct the user to the media review bot.
- **Admin Approval**: Media is forwarded to a private admin group with two inline buttons:
  - `Good`: Forwards the media to the main group and deletes it from the admin group.
  - `Not Good`: Deletes the media from the admin group without forwarding.
- **Custom Messaging**: Admins can use the `/sendmsg` command to send a custom message to any user.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/telegram-media-review-bot.git
   cd telegram-media-review-bot
   ```

2. **Bot Token**: Replace the `TOKEN` in the code with your actual bot token. You can obtain it from [BotFather](https://t.me/botfather) on Telegram.

3. **Group IDs**: 
   - Replace `ADMIN_GROUP_ID` with the ID of the group where admins will review the media.
   - Replace `MAIN_GROUP_ID` with the ID of the main group where approved media will be posted.

4. **Deploy**:
   - The bot is designed to run on Cloudflare Workers or any environment that supports webhooks and HTTP fetch requests. Make sure to configure the bot's webhook accordingly:
   
     ```bash
     curl -F "url=https://your-worker-url" https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook
     ```

## Commands

- **/submitmedia**: Sends a button to the user with a link to submit their media for review.
- **/sendmsg <userId> <message>**: Sends a custom message to the user with the specified `userId`. This command is only executable by admins within the admin group.

## Inline Buttons

- **Good**: Forwards the media to the main group with a mention of the original poster and deletes the message from the admin group.
- **Not Good**: Deletes the media from the admin group without forwarding.

## Usage Example

1. A user sends media or text to the bot.
2. The bot forwards the media/text to the admin group for review.
3. Admins can choose to either approve or reject the media using the inline buttons.
4. Approved media is sent to the main group with a mention of the user who posted it.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
