const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdfkit = require("pdfkit");
const path = require("path");
const { exec } = require("child_process");
const router = express.Router();
const fsExtra = require("fs-extra");

const PORT = process.env.PORT || 8000;

const outputFilePath = "output.pdf";

var app = express();

app.use(cors());

app.use(express.static("public"));

var list = "";

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "../client/src/assets");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const imageFilter = function (req, file, cb) {
	if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
		cb(null, true);
	} else {
		cb(null, false);
		return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
	}
};

// const pdfGenerator = (images) => {
// 	console.log(images.length);
// 	const PDFDocument = new pdfkit();
// 	PDFDocument.pipe(fs.createWriteStream("./merge/output.pdf"));
// 	for (let i = 0; i < images.length; i++) {
// 		if (i === images.length - 1) {
// 			PDFDocument.image(`${images[i].path}`, {
// 				fit: [250, 300],
// 				align: "left",
// 				valign: "center",
// 			});
// 		} else {
// 			PDFDocument.image(`${images[i].path}`, {
// 				fit: [800, 800],
// 				align: "center",
// 				valign: "center",
// 			});
// 			PDFDocument.addPage();
// 		}
// 	}
// 	PDFDocument.end();
// };

var upload = multer({ storage: storage, fileFilter: imageFilter });

// app.post("/upload", function (req, res) {
// 	upload(req, res, function (err) {
// 		if (err instanceof multer.MulterError) {
// 			return res.status(500).json(err);
// 		} else if (err) {
// 			return res.status(500).json(err);
// 		}
// 		res.status(200).send(req.files);
// 		// pdfGenerator(req.files);
// 	});
// });

// app.use("/download", express.static(path.join(__dirname, "download")));
// app.get("/download", (req, res) => {
// 	var file = __dirname + "output.pdf";
// 	res.download(file);
// });

router.get("/download", function (req, res, next) {
	console.log(req);

	let file = path.join(__dirname, "./output.pdf");
	console.log(file);
	res.download(file);
});

//merge

app.post("/merge", upload.array("files", 1000), (req, res) => {
	list = "";
	if (req.files) {
		req.files.forEach((file) => {
			list += `${file.path}`;
			list += " ";
		});

		console.log(list);

		exec(`magick convert ${list} ${outputFilePath}`, (err, stderr, stdout) => {
			if (err) throw err;
			res.sendStatus(200);

			// res.download(outputFilePath, (err) => {
			// 	if (err) throw err;
			// 	console.log("downloading");
			// req.files.forEach((file) => {
			// 	fs.unlinkSync(file.path);
			// });

			// fs.unlinkSync(outputFilePath);
		});
		// });
	}
});

app.get("/download", (req, res) => {
	var file = path.join(__dirname, "output.pdf");

	fs.readFile(file, (err, data) => {
		res.contentType("application/pdf");
		res.send(data);
	});
	fsExtra.emptydirSync("../client/src/assets");
});

app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});

// heroku setting

if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
}
