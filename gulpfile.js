const fs = require("fs");
const which = require("which");
const yargs = require("yargs");
const env = require("gulp-env");
const path = require("path");
const gulp = require("gulp");
const less = require("gulp-less");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const markdown = require("./convert/convert");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

let argv = null;

async function parseArguments() {
    if (argv) {
        // Already parsed
        return;
    }

    args = yargs
        .option("p", {
            alias: "pythonPath",
            type: "string",
            describe: "The path to your python executable.",
            demandOption: true
        })
        .coerce("pythonPath", function (p) {
            p.strip;
            if (!fs.existsSync(p)) {
                m = `Path does not exists: ${p}`;
                console.error(m);
                throw m;
            }
            return p;
        }).argv;

    // Add python dir to path
    pythonDir = null;
    if (args.pythonPath) {
        pythonDir = path.dirname(args.pythonPath);
        console.log(`Setting python path ${pythonDir}`);
        env.set({
            PATH: pythonDir + path.delimiter + process.env.PATH
        });
    }

    await which("python")
        .then((p) => {
            if (pythonDir && !p.includes(pythonDir)) {
                throw `Executable 'python' not found in path '${pythonDir}'`;
            }
            console.log(`Found 'python' : '${p}'`);
        })
        .catch((e) => {
            console.error(e);
            console.error("You need 'python' in your path!");
            console.errer(process.env.PATH);
            process.exit(1);
        });

    // Set as parsed
    argv = args;
}

/* Task to compile less */

gulp.task("compile-less", async function () {
    await gulp.src("css/src/main.less").pipe(less()).pipe(gulp.dest("./css"));
});

/* Task to compile all markdown files */
gulp.task("compile-markdown-html", async function () {
    await parseArguments();
    await markdown.htmlExport(path.resolve("./Content.md"));
});

/* Task to compile all markdown files */
gulp.task("compile-markdown-tex", async function () {
    await parseArguments();
    await markdown.pandocExport(path.resolve("./Content.md"));
});

/* Task to compile all markdown files */
gulp.task("compile-markdown-chrome", async function () {
    await parseArguments();
    await markdown.chromeExport(path.resolve("./Content.md"));
});

/* Task to compile all markdown files */
gulp.task("transform-math", async function () {
    const re = /.*\$\$\s+(.+)\$\$.*/gms;
    gulp.src(["includes/Math.md"])
        .pipe(rename("includes/Math.tex"))
        .pipe(replace(re, "$1"))
        .pipe(gulp.dest("convert/pandoc"));
});

const exportTriggerFiles = ["**/*.md", "literature/**/*", "files/**/*", "includes/**/*"];
const lessFiles = ["css/src/*", "css/fonts/*"];

/* Task to watch all markdown files */
gulp.task("watch-markdown-html", async function () {
    return gulp.watch([...exportTriggerFiles, ...lessFiles], gulp.series(["compile-less", "compile-markdown-html"]));
});

/* Task to watch all markdown files */
gulp.task("watch-markdown-latex", async function () {
    gulp.watch(exportTriggerFiles, gulp.series(["transform-math", "compile-markdown-tex"]));
});

/* Task to watch all markdown files */
gulp.task("watch-markdown-chrome", async function () {
    gulp.watch([...exportTriggerFiles, ...lessFiles], gulp.series(["compile-less", "compile-markdown-chrome"]));
});

/* Task when running `gulp` from terminal */
gulp.task("build-html", gulp.parallel(["watch-markdown-html"]));

/* Task when running `gulp` from terminal */
gulp.task("build-pdf-tex", gulp.parallel(["watch-markdown-latex"]));

/* Task when running `gulp` from terminal */
gulp.task("build-pdf-crhome", gulp.parallel(["watch-markdown-chrome"]));

gulp.task("show-markdown", function () {
    browserSync.init({
        server: {
            baseDir: "./",
            index: "Content.html"
        }
    });
    gulp.watch("**/*.html").on("change", reload);
});
