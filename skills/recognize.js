/*
Module for detecting recognition
*/

const emoji = process.env.EMOJI || ':toast:';
const userRegex = /<@([a-zA-Z0-9]+)>/g;
const tagRegex = /#(\S+)/g;
const emojiRegex = new RegExp(emoji, 'g');

/*
  messageText: a raw slack message to parse

  returns
    a list of users
*/
function extractUsers(messageText) {
  return (messageText.match(userRegex) || [])
    .map(user => user.slice(2, -1));
}

/*
  messageText: a raw slack message to parse

  returns
    a list of tags
*/
function extractTags(messageText) {
  return (messageText.match(tagRegex) || [])
    .map(user => user.slice(1));
}

/*
  messageText: a raw slack message to parse

  returns
    a count of the number of emojis in the message
*/
function countEmojis(messageText) {
  return (messageText.match(emojiRegex) || []).length;
}

module.exports = function (controller) {
  controller.hears([emoji], 'ambient', (bot, message) => {
    const count = countEmojis(message.text);
    const users = extractUsers(message.text);
    const tags = extractTags(message.text);

    // make sure there was a mention in the message
    if (users.length === 0) {
      bot.whisper(message, 'Forgetting something?  Try again...this time be sure to mention who you want to recognize with `@user`');
      return;
    }

    // block giving recognition to myself
    if (users.indexOf(message.user) >= 0) {
      bot.reply(message, {
        text: `Nice try <@${message.user}>`,
        attachments: [
          {
            title: 'fail',
            image_url: 'https://media0.giphy.com/media/ac7MA7r5IMYda/giphy-downsized.gif?cid=6104955e5c763d742e4f524832508da2',
          },
        ],
      });
      return;
    }


    users.forEach((u) => {
      [...Array(count)].forEach(() => {
        // TODO: call service to write recognition to DB
        console.log(`Recording recognition for ${u} from ${message.user} in channel ${message.channel} with tags ${tags}`);
      });

      // TODO: add the new balance to the message
      bot.say({
        text: `You just got recognized by <@${message.user}> in <#${message.channel}>!\n>>>${message.text}`,
        channel: u,
      });
    });

    // TODO: add # left to give for today in the whisper below
    bot.whisper(message, 'Your recognition has been sent.  Well done!');
  });
};