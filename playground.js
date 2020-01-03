var arrayOfObjects = [
    {
        "name": "Rose",
        "age": "5 months"
    },
    {
        "name": "Wanda",
        "age": "398 months"
    },
    {
        "name": "Matt",
        "age": "389 months"
    }
]


console.log(arrayOfObjects.find(element => element.name === "Wanda").age);