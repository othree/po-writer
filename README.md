# po-writer

A simple [gettext](https://www.gnu.org/software/gettext/) Po file writer.

## Usage

Create instance

```js
import Po from 'po-writer';

let po = new Po();
```

Add translations:

```js
po.add({
  id: 'hello world',
  str: '夜露死苦'
})
```

Create write stream and write to file:

```js
let stream = fs.createWriteStream(targetFilePath);

po.writeToStream(stream);
```

## API

### `constructor(headers)`

`headers` is an object contains file header. Current support header fields and default values:

* Project-Id-Version: 'PACKAGE VERSION',
* POT-Creation-Date: now,
* PO-Revision-Date: now,
* Last-Translator: '',
* Language-Team: 'none',
* MIME-Version: '1.0',
* Content-Type: 'text/plain; charset=UTF-8',
* Content-Transfer-Encoding: '8bit',
* Plural-Forms: 'nplurals=INTEGER; plural=EXPRESSION;'

### `add(msg)`

Add an tranlated [message](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html) to Po.
`msg` support attributes:

* translatorComments
* extractedComments
* reference
* flag
* context
* id
* plural
* str (string|string[])

### `remove(id)`

Remove translation message from Po. `id` is an msg id or an array of msg ids.

### `writeToStream(stream)`

Write the content of Po file to writable stream.
