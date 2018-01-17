import Po from '..';

let buffer = '';

const stream = {
  write (str) {
    buffer = buffer + str;
  }
};

const trans = new Po();

trans.add({
  id: 'test 1',
  str: 'test translation 1'
});

trans.writeToStream(stream);

console.log(buffer);

