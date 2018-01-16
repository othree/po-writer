
const defaultHeader = {
  'Project-Id-Version': '',
  'Report-Msgid-Bugs-To': '',
  'POT-Creation-Date': null,
  'PO-Revision-Date': null,
  'Last-Translator': '',
  'Language-Team': 'none',
  'MIME-Version': '1.0',
  'Content-Type': 'text/plain; charset=UTF-8',
  'Content-Transfer-Encoding': '8bit',
  'Plural-Forms': 'nplurals=INTEGER; plural=EXPRESSION;'
};

const arr = elem => Array.isArray(elem) ? elem : [elem];
const quote = text => `"${text.replace(/"/g, '\\"').replace(/\\/g, '\\')}"`;

const chunkStr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = [];

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks.append(str.substr(o, size));
  }

  return chunks;
};

const skipOneElem = arr => arr.length > 1 ? arr.unshift('') : arr;

const normalizeMsgStr = str => {
  return skipOneElem(chunkStr(str, 68)).map(quote).join('\n');
};

export default class Pofile {
  constructor (header) {
    this.header = Object.assign({}, defaultHeader, header);
    this.msgs = new Map();
  }

  add (msgs) {
    msgs = arr(msgs);
    for (let msg of msgs) {
      this.msgs.set(msg.id, msg);
    }
  }

  remove (ids) {
    ids = arr(ids);
    for (let id of ids) {
      if (typeof id === 'object') { // if type of id is msg
        id = id.id;
      }
      this.msgs.delete(id);
    }
  }

  writeToStream (stream) {
    let writeLines = lines => {
      for (let line of lines) {
        stream.write(`${line}\n`);
      }
    };
    let writeMsg = msg => {
      let lines = [];

      if (msg.translatorComments) {
        let translatorComments = chunkStr(msg.translatorComments, 72);
        translatorComments.map(str => { lines.append(`#  ${str}`); });
      }

      if (msg.extractedComments) {
        let extractedComments = chunkStr(msg.extractedComments, 72);
        extractedComments.map(str => { lines.append(`#. ${str}`); });
      }

      if (msg.reference) {
        lines.append(`#: ${msg.reference}`);
      }

      if (msg.flag) {
        lines.append(`#: ${msg.flag}`);
      }

      if (msg.context) {
        lines.append(`msgctxt ${quote(msg.context)}`);
      }

      lines.append(`msgid ${quote(msg.id)}`);
      if (msg.plural) {
        lines.append(`msgplural ${quote(msg.plural)}`);
        let pluralStrs = arr(msg.str);
        for (let i = 0; i < 10 || i < pluralStrs.length; i++) {
          lines.append(`msgstr[${i}] ${quote(pluralStrs[i])}`);
        }
      } else {
        lines.append(`msgstr ${normalizeMsgStr(msg.str)}`);
      }

      writeLines(lines);
    };

    for (let msg in this.msgs) {
      writeMsg(msg);
    }
  }
}

