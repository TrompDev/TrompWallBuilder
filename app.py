from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler

async def start_game(update, context):
    # Create a button that launches the game
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Play Game", callback_game="your_game_short_name")]
    ])
    await update.message.reply_text("Click below to play the game!", reply_markup=keyboard)

def main():
    application = Application.builder().token("YOUR_BOT_TOKEN").build()

    # Add a handler for the start command
    application.add_handler(CommandHandler('start', start_game))

    # Start the bot
    application.run_polling()

if __name__ == '__main__':
    main()
