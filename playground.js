var arrayOfObjects = [
  {
    name: 'Rose',
    age: '5 months'
  },
  {
    name: 'Wanda',
    age: '398 months'
  },
  {
    name: 'Matt',
    age: '389 months'
  }
];

console.log(arrayOfObjects.find(element => element.name === 'Wanda').age);
var menu = require('console-menu');
var programRunning = true;
menu(
  [
    { hotkey: 'n', title: '(n)ew plugin', selected: true, choice: 'new' },
    { hotkey: 'e', title: '(e)dit plugin', choice: 'edit' },
    { hotkey: 'x', title: 'e(x)it program', choice: 'exit' },
    { separator: true },
    { hotkey: 'h', title: '(h)elp', choice: 'help' }
  ],
  {
    header: 'PowerQuery Builder',
    border: true
  }
).then(item => {
  if (item) {
    switch (item.choice) {
      case 'new':
        console.log('You have chosen to create a new Plugin');
        break;
      case 'edit':
        console.log('You have chosen to edit a previously created plugin');
        break;
      case 'exit':
        console.log('Exiting Application.  Goodbye');
        break;
      case 'help':
        console.log('Help.  I need somebody');
        break;
    }
  } else {
    console.log('You canceled the menu.  Goodbye');
  }
});
