import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { networkInterfaces } from "os";
import { keyInSelect } from "readline-sync";

const port = 8080;
let address =
  "http://" +
  (() => {
    let localIPs = Object.values(networkInterfaces())
      .filter((net) => !!net)
      .flatMap((net) => net!)
      .filter((net) => net.family === "IPv4" && !net.internal)
      .map((net) => net.address);
    if (localIPs.length > 1) {
      return localIPs[
        keyInSelect(localIPs, "Select an ip to be displayed: ", {
          cancel: false,
        })
      ];
    } else {
      return localIPs[0];
    }
  })() +
  ":" +
  port;

const share_dir = process.argv[2] ?? ".";

const app = express();
const storage = multer.diskStorage({
  destination: (req, _, cb) => {
    cb(null, path.resolve(req.body.path));
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use("/fileshare/dist", express.static(path.join(__dirname, "..", "dist")));
app.use("/fileshare", express.static(path.join(__dirname, "..", "public")));

app.post("/fileshare/upload", upload.array("files"), (_, res) => {
  res.send("uploaded");
});

app.all("*", (req, res) => {
  const req_path = path.join(share_dir, decodeURIComponent(req.path));
  const show_hidden = req.query.h === "1";
  if (!fs.existsSync(req_path)) res.sendStatus(404);
  else if (fs.lstatSync(req_path).isDirectory()) {
    res.render("index.ejs", {
			address: address,
      show_hidden: show_hidden,
      title: path.basename(req_path),
      directory: fs
        .readdirSync(req_path)
        .filter((p) => show_hidden || !p.startsWith("."))
        .map((p) => {
          return {
            isDir: fs.lstatSync(path.join(req_path, p)).isDirectory(),
            path:
              encodeURIComponent(path.join(req_path, p)) +
              (show_hidden ? "?h=1" : ""),
            name: p,
          };
        })
        .sort((a, b) =>
          b.isDir != a.isDir
            ? Number(b.isDir) - Number(a.isDir)
            : a.name.localeCompare(b.name)
        ),
    });
  } else res.sendFile(path.resolve(req_path));
});

app.listen(port);
