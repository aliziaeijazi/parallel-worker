let minT = 5,
  maxT = 20,
  zindex = 3;
let startflag = true;
const DocCount = 20;
const WorkerCount = 8;
let DocObject = [];
let WorkerObject = [];
function createDoc(num, time) {
  return `<div id="doc${num}" class="m-1 card" style="width: 7rem ; z-index:2">
<h5 class="card-header">doc ${num}</h5>
<div class="card-body">
  <p class="card-text">Doc</p>
  <p class="text-danger card-text">Time: ${time}</p>
</div>
</div>`;
}
function getRandomArbitrary(min = 5, max = 10) {
  return Math.floor(Math.random() * (max - min) + min);
}
function addDoc(DCount, min, max) {
  for (let index = 1; index <= DCount; index++) {
    time = getRandomArbitrary(min, max);
    $("#TODO").append(createDoc(index, time));
    DocObject.push({ id: index, time: time });
  }
  $("#TODOCount").html(DCount);
}
addDoc(DocCount, minT, maxT);

function createworker(num) {
  return `<div class="m-1 card" style="background-color: #a0e7e5; width: 150px ; height:220px">
    <h5 class="card-header">W${num}</h5>
    <div id="Workerbody${num}" class="d-flex justify-content-center align-items-center card-body">
        </div>
    </div>`;
}
function addWorker(WCount) {
  for (let index = 1; index <= WCount; index++) {
    $("#doingbody").append(createworker(index));
    WorkerObject.push({ id: index });
  }
  $("#doingcount").html(WCount);
}

addWorker(WorkerCount);
function getAnimateToDoingtop(worker, doc) {
  let marginy = worker.parent().height() - doc.height();
  marginy /= 4;
  let top = worker.offset().top - doc.offset().top + marginy;
  return top;
}
function getAnimateToDoingleft(worker, doc) {
  let marginx = worker.parent().width() - doc.width();
  marginx /= 2;
  let left = worker.offset().left - doc.offset().left + marginx;
  return left;
}
function getAnimateToDonetop(doc) {
  let top = $("#hidden").offset().top - doc.offset().top;
  console.log(top);
  return top;
}
function getAnimateToDoneleft(doc) {
  let left = $("#hidden").offset().left - doc.offset().left;
  console.log(left);
  return left;
}
function start() {
  if (startflag) {
    const queueGenerator = (function* () {
      for (const item of DocObject) yield item;
    })();

    const sampleAsyncOp = (job, ms) =>
      new Promise((res, rej) => setTimeout(() => res(job), ms * 1000));

    const allAsyncOps = [];
    let queueEndReached = false;
    WorkerObject.forEach(async (worker) => {
      //   console.log("Worker", worker.id, "started!");
      for (const job of queueGenerator) {
        $(`#doc${job.id}`).css("z-index", zindex);
        zindex++;
        $(`#doc${job.id}`).animate(
          {
            top: `${getAnimateToDoingtop(
              $(`#Workerbody${worker.id}`),
              $(`#doc${job.id}`)
            )}`,
            left: `${getAnimateToDoingleft(
              $(`#Workerbody${worker.id}`),
              $(`#doc${job.id}`)
            )}`,
          },
          1000
        );
        setTimeout(function () {
          $(`#doc${job.id}`).animate({ top: 0, left: 0 }, 0);
          $(`#Workerbody${worker.id}`).append($(`#doc${job.id}`));
          $("#TODOCount").html($("#TODOCount").html() - 1);
        }, 1000);

        const asyncOp = sampleAsyncOp(job, job.time);
        allAsyncOps.push(asyncOp);
        const jobResult = await asyncOp;
        console.log(
          "Worker",
          worker,
          "FINISHED Job",
          job,
          `(confirmed ${jobResult == job})`
        );
        $(`#doc${job.id}`).css("z-index", zindex);
        zindex++;
        $(`#doc${job.id}`).animate(
          {
            top: `${getAnimateToDonetop($(`#doc${job.id}`))}`,
            left: `${getAnimateToDoneleft($(`#doc${job.id}`))}`,
          },
          1000
        );
        setTimeout(function () {
          $(`#doc${job.id}`).animate({ top: 0, left: 0 }, 0);
          $(`#hidden`).before($(`#doc${job.id}`));
          $("#donecount").html(+$("#donecount").html() + 1);
        }, 1000);
      }
      setTimeout(function () {
        $(`#Workerbody${worker.id}`).append(
          '<i class="text-success fas fa-clipboard-check fs-1" style="display:none"></i>'
        );
        $(`#Workerbody${worker.id}`).children().show(250)
      }, 1000);
      

      if (!queueEndReached) {
        console.log(
          "First jobless worker. End of Queue Reached! Waiting for all to finish."
        );
        Promise.all(allAsyncOps).then((results) => {
          console.log("ALL FINISHED!!!", results);
          $("#hidden").hide();
        });
        queueEndReached = true;
      }
    });
  }
  startflag = false;
}

$("#start").click(start);
