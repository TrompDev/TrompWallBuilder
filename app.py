import os
import logging
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ParseMode
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, CallbackContext
from dotenv import load_dotenv
from pathlib import Path

# Force reload of environment variables
load_dotenv(override=True)

# Get environment variables
BOT_TOKEN = os.getenv("BOT_TOKEN")
MINI_APP_URL = os.getenv("MINI_APP_URL")
THUMBNAIL_URL = os.getenv("THUMBNAIL_URL")

# Print THUMBNAIL_URL for debugging
print(f"Loaded THUMBNAIL_URL: {THUMBNAIL_URL}")

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

HELP_IMAGE_PATH = Path(__file__).parent / "help_image.jpg"

def get_file_info(url):
    try:
        logger.info(f"Attempting to access URL: {url}")
        response = requests.head(url, allow_redirects=True)
        size = int(response.headers.get('Content-Length', 0))
        content_type = response.headers.get('Content-Type', '')
        return f"Size: {size/1024/1024:.2f}MB, Type: {content_type}, Status: {response.status_code}"
    except requests.RequestException as e:
        return f"Error getting file info: {e}"

async def start(update: Update, context: CallbackContext):
    """Sends a message with thumbnail and mini app button when /start is used."""
    try:
        # Create the mini app button
        button = InlineKeyboardButton(
            text="Play Tromp Wall Builder",
            url=MINI_APP_URL
        )
        keyboard = InlineKeyboardMarkup([[button]])

        # Enhanced message with bold text and line breaks
        message = (
            "🎮 Ready to play <b>Tromp Wall Builder</b>? 🎮\n\n"
            "<b>Build or Remove Tromp's famous Wall</b> in <b>Tromp Wall Builder</b> to help or stop the Immigrants from entering <b>USA!</b> 🇺🇸\n\n"
            "<b>Click the button below</b> to start your journey! 🚀"
        )

        if THUMBNAIL_URL:
            logger.info(f"Using THUMBNAIL_URL: {THUMBNAIL_URL}")
            file_info = get_file_info(THUMBNAIL_URL)
            logger.info(f"GIF Info: {file_info}")

            try:
                await update.message.reply_animation(
                    animation=THUMBNAIL_URL,
                    caption=message,
                    reply_markup=keyboard,
                    parse_mode=ParseMode.HTML
                )
                logger.info("Animation sent successfully.")
            except Exception as e:
                logger.error(f"Error sending animation: {e}")
                # Fallback to sending a message without the animation
                await update.message.reply_text(
                    text=f"{message}\n\n(Unable to load thumbnail: {e})",
                    reply_markup=keyboard,
                    parse_mode=ParseMode.HTML
                )
        else:
            logger.warning("THUMBNAIL_URL not provided")
            await update.message.reply_text(
                text=message,
                reply_markup=keyboard,
                parse_mode=ParseMode.HTML
            )
    except Exception as e:
        logger.error(f"Error in start handler: {e}")
        await update.message.reply_text("An error occurred while trying to start the game.")

async def help_command(update: Update, context: CallbackContext):
    """Sends a help message with an image when the command /help is issued."""
    help_message = (
        "🎮 Welcome to Tromp Wall Builder! 🇺🇸\n\n"
        "To start your wall adventure, use the /start command! 🚀\n\n"
        "Choose your path:\n"
        "🧱 Build the wall or 🔨 Remove it\n"
        "🚫 Stop immigrants or 🤝 Help them\n"
        "🏆 Shape America's future!\n\n"
        "🔄 Your choices can change at any time\n"
        "🌟 Every decision impacts the game\n\n"
        "Type /start now and begin your journey! 💪🇺🇸"
    )

    logger.info(f"HELP_IMAGE_PATH: {HELP_IMAGE_PATH.resolve()}")
    logger.info(f"Does help_image.jpg exist? {HELP_IMAGE_PATH.exists()}")

    if HELP_IMAGE_PATH.exists():
        try:
            with open(HELP_IMAGE_PATH, 'rb') as photo:
                await update.message.reply_photo(
                    photo=photo,
                    caption=help_message,
                    parse_mode=ParseMode.HTML
                )
            logger.info("Help image sent successfully.")
        except Exception as e:
            logger.error(f"Error sending help image: {e}")
            await update.message.reply_text(
                text=f"{help_message}\n\n(Unable to load help image: {e})",
                parse_mode=ParseMode.HTML
            )
    else:
        logger.warning("HELP_IMAGE_PATH does not exist.")
        await update.message.reply_text(
            text=f"{help_message}\n\n(Help image not found)",
            parse_mode=ParseMode.HTML
        )

async def button_handler(update: Update, context: CallbackContext):
    """Handles the button presses."""
    try:
        query = update.callback_query
        await query.answer()
    except Exception as e:
        logger.error(f"Error in button_handler: {e}")

async def error_handler(update: object, context: CallbackContext) -> None:
    """Log the error and send a message to notify the user."""
    logger.error(msg="Exception while handling an update:", exc_info=context.error)

def main():
    """Start the bot."""
    # Define the Application and pass it your bot's token.
    application = Application.builder().token(BOT_TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))  # Added help command handler
    application.add_handler(CallbackQueryHandler(button_handler))

    # Add the error handler
    application.add_error_handler(error_handler)

    # Run the bot until you press Ctrl-C
    application.run_polling()

if __name__ == '__main__':
    main()
