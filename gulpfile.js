const gulp = require("gulp");
const rename = require("gulp-rename");
const dateFormat = require("dateformat");
const watch = require("gulp-watch");
const fs = require("fs");
const argv = require("yargs").argv;
const path = require("path");

const tgt = ["ws/**/*.psd","!ws/**/_*.psd"];
const cwd = process.cwd();

console.log(process.argv);
console.log(argv);

const numPad = 5;
const cache = {};

function incrementNumber(dir, filename){
  const files = fs.readdirSync(path.join(cwd, dir));
  console.log(files);
  const list = files.filter(function(f){
    return f.includes(filename);
  });
  list.sort(function(a, b){
    if (a < b) {
       return -1;
    }
    if (a > b) {
       return 1;
    }
    return 0;
  });

  const current = list[list.length - 1];
  if(!current){
    return;
  }

    // const m = current.match(/\_[\d]{0,5}$/);
  const m = current.match("\_\[\\d\]{" + numPad + "}.*\$");
  if(m){
    const num = Number(m[0].replace(/^_/, "").replace(/\..*$/, ""));
    // console.log("num", num);
    if(cache[filename]){
      cache[filename].number = num;
    }else{
      cache[filename] = { number: num };
    }
  }
}

const modes = {
  datetime: {
    format: function(name){
      const now = new Date();
      return dateFormat(now, "yyyymmdd_HHMMss");
    }
  },
  number: {
    format: function(name){
      let number = 0;
      incrementNumber("dist", name);
      if(cache[name]){
        number = cache[name].number;
      }else{
        cache[name] = { number: number};
      }
      number++;
      const str = String(number).padStart(5, 0);
      cache[name].number = number;
      return str;
    }
  }
};

let mode = "datetime";
if(argv.mode === "number"){
  mode = "number";
}

function copy(p){
  const file = p.path;
  return gulp.src(file)
      .pipe(rename(function(path){
        path.basename += "_" + modes[mode].format(path.basename);
        console.log("FileName: " + path.basename);
      }))
      .pipe(gulp.dest("dist"));
}

function watchFile(){
  return watch(tgt, function(p){ return copy(p); });
}

const start = gulp.parallel(watchFile);
gulp.task("start", start);


exports.default = start;