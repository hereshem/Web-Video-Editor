let video = document.querySelector(".video");
let slider = document.getElementById('slider');

let video_size = {'w': 0, 'h': 0};
let filename = 'in.mp4';
let time_start = 0;
let time_end = 1;
let selected_file = null;

$(function() {
	$("#video_selector").change(function (e) {
		let fileInput = e.target;
		let fileUrl = window.URL.createObjectURL(fileInput.files[0]);
		filename = fileInput.files[0].name;
		selected_file = fileInput.files[0];
		$(".video").attr("src", fileUrl);
		e.target.remove();
	});

	$("#mute_toggle").click(function (){
		$(video).prop('muted', !$(video).prop('muted'));
	});

	$(".video").bind("loadedmetadata", function (e) {
		video_size = {'w': this.videoWidth, 'h': this.videoHeight};
		$('.hide_until_load').removeClass('hidden');
		noUiSlider.create(slider, {
			start: [0, this.duration],
			connect: true,
			range: {
				'min': 0,
				'max': this.duration
			}
		});
		slider.noUiSlider.on('update', (range)=>{
			update_slider_fields(range);
		});
		update_slider_fields();
	}).bind('loadeddata', function(e) {
		// noinspection JSIgnoredPromiseFromCall
		e.target.play();  // start playing
	}).on('pause', (e)=>{
		console.log('Paused: ', e.target.currentTime)
	});

	$('.slider_control').on('change', (e)=>{
		set_slider();
	});

	$('.slider_time_pos').mousedown((e)=>{
		let ele = e.target;
		let last_pos = e.clientX;
		function mup(e, ele){
			console.log('up');
			document.onmousemove = null;
			document.onmouseup = null;
		}
		function mmov(e, ele){
			let delta = e.clientX - last_pos;
			console.log('Delta:', delta);
			last_pos = e.clientX;
			let total_percent = (ele.offsetLeft+delta)/ele.parentElement.offsetWidth;
			console.log(total_percent);
			video.currentTime = video.duration * total_percent
		}
		document.onmousemove = (e)=>{mmov(e, ele)};
		document.onmouseup = (e)=>{mup(e, ele)};
	});

});


function update_slider_fields(range){
	if(!range || range.length < 2)
		return;
	document.querySelectorAll('.slider_control').forEach(function(input) {
		// noinspection JSUndefinedPropertyAssignment
		input.value = range[input.dataset.pos];
	});
	time_start = parseFloat(range[0]);
	time_end = parseFloat(range[1]);
}

function set_slider(){
	let vals = [];
	document.querySelectorAll('.slider_control').forEach(function(input) {
		vals.push(input.value)
	});
	console.log(vals);
	slider.noUiSlider.set(vals);
}


function pause_toggle(){
	console.log('toggle play');
	if(video.paused){
		video.play().finally(()=>{$(".play_toggle").html('&#10074;&#10074;')});
	}else{
		video.pause();
		$(".play_toggle").html('&#9654;')
	}
}

function update(){
	if (video.currentTime < time_start)
		video.currentTime = time_start;
	if (video.currentTime > time_end)
		video.currentTime = time_start;
	let complete_percent = 100 * (video.currentTime / video.duration);
	$(".slider_time_pos").css("left", complete_percent + "%");
	$(".current_time").text(video.currentTime.toFixed(2));
	requestAnimationFrame(update.bind(this)); // Tell browser to trigger this method again, next animation frame.
}

update(); //Start rendering
