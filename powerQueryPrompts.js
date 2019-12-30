const prompts = require ('prompts')
const newQueryPrompt = [
    {
      type: 'text',
      name: 'name',
      message: 'What is the name of the PowerQuery?'
    },
    {
      type: 'text',
      name: 'area',
      message: 'What is the area of the PowerQuery'
    },
    {
      type: 'text',
      name: 'coreTable',
      message: 'What is the coreTable for the Query?'
    },
    {
        type: 'text',
        name: 'description',
        message: 'Give a brief description of the PowerQuery',
    }
  ];


function newQuery(){
    (async () => {
    const response = await prompts(newQueryPrompt);
   
    return response;
  })();
}



