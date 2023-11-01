
let classesData = [{
    className: "Class 1",
    imagecount: 0
},
{
    className: "Class 2",
    imagecount: 0
}

]

let canvas
let video
let mobilenet
let classifier


let classesdiv = document.getElementById("classesdiv")
let addnewclassbtn = document.getElementById("addnewclassbtn")
let starttrainbtn = document.getElementById("starttrainbtn")
let previewcanvas = document.getElementById("previewcanvas")
let previewsliderbox = document.getElementById("previewsliderbox")

let downloadbtn = document.getElementById("downloadbtn")
let downloadbtndiv = document.getElementById("downloadbtndiv")


downloadbtn.addEventListener("click", e => {
    classifier.save()
})

// handle open webcam
document.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('activatecambtn')) {

        let key = event.target.getAttribute("key")

        console.log("activate webcam", event.target.getAttribute("key"))


        // resize canvas
        // let divwidth = document.getElementById("canvasbox-0").offsetWidth
        // console.log(divwidth)

        //   resizeCanvas(divwidth, divwidth / 1.7);




        // move p5js canvas to the div you want to open
        canvas.parent(`canvasbox-${key}`);

        // close every cam box div
        for (let index = 0; index < classesData.length; index++) {
            document.getElementById(`cardcambox-${index}`).style.display = "none"
        }

        // open cam box div
        document.getElementById(`cardcambox-${event.target.getAttribute("key")}`).style.display = "block"
    }
});


// handle capture 
document.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('capturecanvasbtn')) {
        let key = event.target.getAttribute("key")

        console.log("capture canvas", event.target.getAttribute("key"))


        // for now we just add the iage in canvas to classifier
        console.log("class name:", classesData[key].className)


        classesData[key].imagecount++

        document.getElementById(`imagecountui-${key}`).innerText = classesData[key].imagecount
        classifier.addImage(classesData[key].className)



    }
});

// handle card title changes
document.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('card-title')) {
        const cardTitle = event.target;
        const elementkey = cardTitle.getAttribute("key")
        const cardTitleInput = document.getElementById(`card-title-input-${elementkey}`)
        //   console.log(cardTitleInput)


        // Enable editing
        cardTitle.style.display = 'none';
        cardTitleInput.style.display = 'block';
        cardTitleInput.value = cardTitle.textContent;
        cardTitleInput.focus();

        // Save the edited title when the input loses focus
        cardTitleInput.addEventListener('blur', function () {
            cardTitleInput.style.display = 'none';

            //  cardTitle.style.display = 'block';

            // change the state
            //   cardTitle.textContent = cardTitleInput.value;
            classesData[elementkey].className = cardTitleInput.value

            // rerender all cards
            renderClassCards()

        });
    }
});

// add new class
addnewclassbtn.addEventListener("click", e => {

    console.log("add class btn pressed")
    classesData.push({
        className: `Class ${classesData.length + 1}`,
        imagecount: 0
    })


    // redefine classifier with new label count options

    let count = classesData.length
    const options = { numLabels: count };
    classifier = mobilenet.classification(video, options)

    // render cards
    renderClassCards()
})

// start training model
starttrainbtn.addEventListener("click", e => {

    starttrainbtn.disabled = true

    // close all class cards
    for (let index = 0; index < classesData.length; index++) {
        document.getElementById(`cardcambox-${index}`).style.display = "none"
    }

    classifier.train(training)
})

// render class card ui
function renderClassCards() {

    classesdiv.innerHTML = ""
    // render classes cards
    for (let index = 0; index < classesData.length; index++) {
        classesdiv.innerHTML +=
            `
    <div class="card mb-3" key="${index}">
    <div class="card-header">

        <h5 key="${index}" class="card-title" id="card-title-${index}">${classesData[index].className} <i class="bi bi-pencil-square"></i></h5>
        <input type="text" id="card-title-input-${index}" class="form-control" style="display: none;">

    </div>
    <div class="card-body">


        <div id="cardcambox-${index}" class="cardcambox text-center" style="display: none;">
        <div class="fullwidthdiv text-center" id="canvasbox-${index}"></div>


        <button key="${index}"  type="button" class="btn btn-primary capturecanvasbtn">Capture</button>

        </div>


        <h5 class="card-title">Add Image Samples (<span id="imagecountui-${index}">${classesData[index].imagecount}</span>)</h5>

        <button key="${index}" type="button" class="btn btn-primary activatecambtn"><i class="bi bi-webcam-fill"></i>
            Webcam</button>

        <button type="button" class="btn btn-primary disabled"><i class="bi bi-upload"></i>
            Upload</button>
    </div>
    </div>
    `;


    }

}


function modelReady() {
    console.log("model readddyyy")
    const options = { numLabels: 2 };
    classifier = mobilenet.classification(video, options)

}


function training(loss) {

    if (loss == null) {
        console.log("training completed")

        // show download div
        downloadbtndiv.style.display = "block"


        document.getElementById("previewplaceholder").style.display = "none"

        // resize the canvas
        //   resizeCanvas(previewcanvas.offsetWidth, previewcanvas.offsetWidth / 1.7);

        // move canvas to preview module
        canvas.parent("previewcanvas")


        // populate the slider box
        for (let index = 0; index < classesData.length; index++) {
            previewsliderbox.innerHTML +=
                `
            <div class="my-2">
            <p>${classesData[index].className}</p>
            <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
            <div id="progress-${classesData[index].className}" class="progress-bar" style="width: 25%; "></div>
            </div>
            </div>
            `

        }


        classifier.classify(gotresults)
    } else {
        console.log(loss)

    }

}

function gotresults(error, result) {
    if (error) {
        console.log(error)
    } else {
        console.log(result)

        // update progress elements
        for (let index = 0; index < result.length; index++) {
            document.getElementById(`progress-${result[index].label}`).style.width = `${result[index].confidence * 100}%`

        }


        classifier.classify(gotresults)
    }

}


function setup() {

    renderClassCards()



    canvas = createCanvas(400, 400 * 0.7); // Set the canvas size to your desired values

    canvas.parent("cardcambox-0");

    video = createCapture(VIDEO)
    video.hide()


    mobilenet = ml5.featureExtractor('MobileNet', modelReady)

}

function draw() {
    background(200)

    image(video, 0, 0, width, height)
    // noLoop()

}


