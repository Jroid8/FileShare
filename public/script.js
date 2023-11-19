const progress_bar = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
function upload() {
	let input = document.createElement("input");
	input.type = "file";
	input.onchange = (_) => {
		const form = new FormData();
		form.append("path", "./" + window.location.pathname.slice(1));
		for (let i = 0; i < input.files.length; i++)
			form.append("files", input.files[i]);
		form.append("files", input.files);
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/fileshare/upload", true);
		xhr.onload = () => {
			progress_bar.style.display = "none";
			if (xhr.status == 200) window.location.reload();
			else alert("Error uploading files. Code: " + xhr.status);
		};
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable)
				progress.style.width = (event.loaded / event.total) * 100 + "%";
		};
		progress_bar.style.display = "flex";
		xhr.send(form);
	};
	input.click();
}
function show_hidden() {
	return new URLSearchParams(window.location.search).get("h") === "1";
}
function toggle_hidden() {
	if (show_hidden()) {
		window.location.search = window.location.search.slice(
			0,
			window.location.search.lastIndexOf("?")
		);
	} else {
		let usp = new URLSearchParams(window.location.search);
		usp.set("h", 1);
		window.location.search = usp.toString();
	}
}
function back() {
	if (mode == MODES.NORMAL)
		window.location =
			window.location.href.slice(0, window.location.href.lastIndexOf("/")) +
			(show_hidden() ? "?h=1" : "");
	else change_mode(MODES.NORMAL);
}
