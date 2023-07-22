function tutorial_1(){
    console.log("hello world")
    chinpang_1_v3().then((return_value)=>{ //if this function works, then will return value
        console.log("i got return", return_value)
        chinpang_2()
    })
}

function tutorial_2(){ //do all in concurrent 
    Promise.all([  //wait both and finish at the same time
        getNasiLemak(),
        getWater()
    ]).then((result)=>{
        console.log(result)
    }).catch((err)=>{ //use catch to catch error [RMB! 1 process failed, whole process fail]
        console.log(err)
    })
}

function tutorial_3(){ //do all sikit sikit sikit go [sequential structure]
    let result = Promise.resolve()
    
    //await function => dont use this function NOT GOOD! It same concept as Thread.sleep() in Java

    result = result.then(()=>{
        return getWater()
    })

    result = result.then(()=>{
        return getNasiLemak()
    })

    result.then(()=>{
        console.log("everything is awesome")
    })
}

tutorial_3()

function chinpang_1(){
    setTimeout(()=>{
        console.log("hello world 2")
    },1000)
}

function chinpang_1_v2(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log("hello world 2 v2")
            resolve('tada!') //once finish, return this value
        },1000)
    })
}

function chinpang_1_v3(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log("hello world 2 v2")
            reject('Im a handsome!') //once I cant get the result, jump to this state
        },1000)
    })
}


function chinpang_2(){
    console.log("hello world 3")
}

function getNasiLemak(){
    return new Promise((resolve, reject)=>{
        console.log("nasi lemak process")
        //resolve("nasi lemak ready")
        reject("nasi lemak finish") //if fail, whole process will fail
    }) // "=>"" means equal or bigger than
}

function getWater(){
    return new Promise((resolve, reject)=>{
        console.log("water process")
        resolve("water ready")

    })
}