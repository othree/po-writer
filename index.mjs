
const now = new Date();

const defaultHeader = {
  'Project-Id-Version': 'PACKAGE VERSION',
  'Report-Msgid-Bugs-To': 'none',
  'POT-Creation-Date': now,
  'PO-Revision-Date': now,
  'Last-Translator': '',
  'Language-Team': 'none',
  'MIME-Version': '1.0',
  'Content-Type': 'text/plain; charset=UTF-8',
  'Content-Transfer-Encoding': '8bit',
  'Plural-Forms': 'nplurals=INTEGER; plural=EXPRESSION;'
};

const headerOrder = [
  'Project-Id-Version',
  'Report-Msgid-Bugs-To',
  'POT-Creation-Date',
  'PO-Revision-Date',
  'Last-Translator',
  'Language-Team',
  'MIME-Version',
  'Content-Type',
  'Content-Transfer-Encoding',
  'Plural-Forms'
];

const pad = num => num >= 10 ? `${num}` : `0${num}`;
const arr = elem => Array.isArray(elem) ? elem : [elem];
const quote = text => `"${text.replace(/\n/g, '\\n').replace(/\\/g, '\\').replace(/"/g, '\\"')}"`;

const chunkStr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = [];

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks.push(str.substr(o, size));
  }

  return chunks;
};

const skipOneElem = arr => arr.length > 1 ? (arr.unshift(''), arr) : arr;

const normalizeMsgStr = str => {
  return skipOneElem(chunkStr(str, 68)).map(quote).join('\n');
};

export default class Pofile {
  /**
   * @param {object} header Po file header
   */
  constructor (header = {}) {
    this.header = Object.assign({}, defaultHeader, header);
    this.msgs = new Map();
  }

  /**
   * @typedef msg
   * @type {object}
   * @property {string} id                 
   * @property {(string|Array)} str
   * @property {string} plural
   * @property {string} translatorComments
   * @property {string} extractedComments
   * @property {string} reference
   * @property {string} flag
   * @property {string} context
   *
   * @see {@link https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html}
   */

  /**
   * @method
   * @name add
   * @description Add translation entries
   *
   * @param {(msg|msg[])} msgs One or more translate messages
   */
  add (msgs) {
    msgs = arr(msgs);
    for (let msg of msgs) {
      this.msgs.set(msg.id, msg);
    }
  }

  /**
   * @method
   * @name remove
   * @description Remove translation entries
   *
   * @param {(msg|msg[]|string|string[])} ids One or more translate messages/ids
   */
  remove (ids) {
    ids = arr(ids);
    for (let id of ids) {
      if (typeof id === 'object') { // if type of id is msg
        id = id.id;
      }
      this.msgs.delete(id);
    }
  }

  /**
   * @method
   * @name formatTimezone
   * @description Format timezone offset value to ISO format
   *
   * @param {number} offset Timezone offset from getTimezoneOffset
   */
  formatTimezone (offset) {
    let sign = offset < 0 ? '+' : '-';
    let hours = Math.floor(Math.abs(offset) / 60);
    let minutes = Math.abs(offset) - hours * 60;

    return `${sign}${pad(hours)}${pad(minutes)}`;
  }

  /**
   * @method
   * @name formatDate
   * @description Format Date object to ISO string
   *
   * @param {Date} d Date object to format
   */
  formatDate (d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}${this.formatTimezone(d.getTimezoneOffset())}`;
  }

  /**
   * @method
   * @name serializeHeader
   * @description Translate header to PO format
   */
  serializeHeader () {
    let strs = [''];
    for (let key of headerOrder) {
      let value = this.header[key] || '';
      if (value.getDate) {
        value = this.formatDate(value);
      }
      strs.push(`${key}: ${value}\\n`);
    }
    return strs;
  }

  /**
   * @method
   * @name writeToStream
   * @description Write translations to writable stream
   *
   * @param {Stream} stream Stream to write
   */
  writeToStream (stream) {
    let writeLines = lines => {
      for (let line of lines) {
        stream.write(`${line}\n`);
      }
    };

    let newLine = () => {
      stream.write('\n');
    };

    let writeMsg = msg => {
      let lines = [];

      if (msg.translatorComments) {
        let translatorComments = chunkStr(msg.translatorComments, 72);
        translatorComments.map(str => { lines.push(`#  ${str}`); });
      }

      if (msg.extractedComments) {
        let extractedComments = chunkStr(msg.extractedComments, 72);
        extractedComments.map(str => { lines.push(`#. ${str}`); });
      }

      if (msg.reference) {
        lines.push(`#: ${msg.reference}`);
      }

      if (msg.flag) {
        lines.push(`#: ${msg.flag}`);
      }

      if (msg.context) {
        lines.push(`msgctxt ${quote(msg.context)}`);
      }

      lines.push(`msgid ${normalizeMsgStr(msg.id)}`);
      if (msg.plural) {
        lines.push(`msgplural ${quote(msg.plural)}`);
        let pluralStrs = arr(msg.str);
        for (let i = 0; i < 10 || i < pluralStrs.length; i++) {
          lines.push(`msgstr[${i}] ${quote(pluralStrs[i])}`);
        }
      } else {
        lines.push(`msgstr ${normalizeMsgStr(msg.str)}`);
      }

      writeLines(lines);
      newLine();
    };

    writeLines([
      'msgid ""',
      `msgstr ${this.serializeHeader().map(quote).join('\n')}`
    ]);

    newLine();

    for (let msg of this.msgs.values()) {
      writeMsg(msg);
    }
  }
}

