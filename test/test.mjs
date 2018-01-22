import Po from '..';

let buffer = '';

const stream = {
  write (str) {
    buffer = buffer + str;
  }
};

const trans = new Po({
  'POT-Creation-Date': 'none'
});

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

trans.add({
  id: 'test 4',
  str: 'test for doublequote <span class="active">in string</span> and long long long long long long string'
});

trans.add({
  id: 'test 5 for long long long long long long long long long long long long long long long string',
  str: 'test translation for long long long long long long long long long long long long long long long string'
});

trans.add({
  id: 'test 6',
  str: 'test for slash \\'
});

trans.writeToStream(stream);

console.log(buffer);

