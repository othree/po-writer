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

trans.add({
  id: 'test 2',
  str: 'test translation for long long long long long long long long long long long long long long long string'
});

trans.add({
  id: 'test 3',
  str: `test translation for 
multiline string`
});

trans.writeToStream(stream);

console.log(buffer);

