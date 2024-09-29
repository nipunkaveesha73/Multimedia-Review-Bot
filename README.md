```markdown
# Multimedia Review Bot

**Multimedia Review Bot** is a Telegram bot created for the group **MONTISOORIYA💀❤️** by **API Machanla**. The bot helps users submit media files for admin approval before they are posted in the main group.

## Features

- **User Media Submission**: Users can send media files to the bot for review.
- **Admin Review**: The bot forwards media to an admin-only group with two inline buttons: "Good" and "Not Good."
- **Approval Process**:
  - If an admin clicks "Good," the bot forwards the media to the main group and tags the user who submitted it.
  - If an admin clicks "Not Good," the media is deleted from the admin group without forwarding.

## Bot Commands

- `/submitmedia`: Sends a message prompting the user to submit media for admin review.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/multimedia-review-bot.git
   ```

2. Set up your Cloudflare Workers environment and configure the following bot variables in the code:
   - **TOKEN**: Your Telegram bot token
   - **ADMIN_GROUP_ID**: The chat ID of the admin-only group
   - **MAIN_GROUP_ID**: The chat ID of the main group

3. Deploy the bot to Cloudflare Workers.

## Usage

1. In the main group, users can submit media to the bot by typing `/submitmedia`. The bot will respond with a message and a button to upload their media.
2. Admins review the media in the admin group and decide whether to approve or reject it using the inline buttons.

## License

This project is open-source and licensed under the [MIT License](LICENSE).

## Acknowledgements

Special thanks to **API Machanla** for developing the bot for the **MONTISOORIYA💀❤️** group.

