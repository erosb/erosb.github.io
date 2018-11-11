var currentSlideIdx;

var DEFAULT_SLIDE_ACTION = 32;
var PREV_SLIDE = 37;
var NEXT_SLIDE = 39;
var SHOW_OVERVIEW = 27;

document.addEventListener("DOMContentLoaded", function() {
    
    Prism.plugins.NormalizeWhitespace.setDefaults({
	'remove-trailing': true,
	'remove-indent': true,
	'left-trim': true,
	'right-trim': true,
    });
    
    document.querySelectorAll(".instance, .schema, .schema-long").forEach(function(el) {
        console.log(el);
        var content = el.innerHTML;
        el.innerHTML = "<pre><code  class='language-json'>" + content + "</code></pre>";
    });
    
    var allSlides = document.getElementsByClassName("slide");
    var slideCount = allSlides.length;
    var overviewOpen = false;
    
    function slideIdxByHash() {
        if (window.location.hash === "") {
            return 0;
        } else {
            var idx = Number(window.location.hash.substring(1)) - 1;
            if (isNaN(idx)) {
                return 0;
            }
            return Math.max(Math.min(idx, slideCount - 1), 0);
        }
    }
    
    if (allSlides.length > 0) {
        currentSlideIdx = slideIdxByHash();
        scrollToSlide(currentSlideIdx);
    }
    
    var overviewLayer = document.createElement("div");
    (function() {
        slideDivs = document.getElementsByClassName("slide");
        var slideTitles = [];
        for (let slideDiv of slideDivs) {
           slideTitles.push(slideDiv.querySelector("h2").innerText);
        }
        overviewLayer.classList.add("overview-layer");
        overviewTitle = document.createElement("h1");
        overviewTitle.innerText = "Tartalom";
        overviewLayer.appendChild(overviewTitle);
            
        var slideList = document.createElement("ol");
        for (let idx in slideTitles) {
            var title = slideTitles[idx];
            var item = document.createElement("li");
            item.innerHTML = "<a href=\"#" + (Number(idx) + 1) + "\">" + title + "</a>";
            slideList.appendChild(item);
        }
        var slideListCnt = document.createElement("div");
        slideListCnt.appendChild(slideList);
        overviewLayer.appendChild(slideListCnt);
    })();
    
    function openOverview() {
        document.body.appendChild(overviewLayer);
        var titles = overviewLayer.getElementsByTagName("li");
        for (let i = 0; i < titles.length; ++i) {
            if (i == currentSlideIdx) {
                titles[i].classList.add("current");
            } else {
                titles[i].classList.remove("current");
            }
        }
    }
        
    function closeOverview() {
        document.body.removeChild(overviewLayer);
    }
    
    function setSlideState(slide, state) {
        if (state !== "prev" && slide.classList.contains("prev")) {
            slide.classList.remove("prev");
        }
        if (state !== "current" && slide.classList.contains("current")) {
            slide.classList.remove("current");
        }
        if (state !== "next") {
            slide.classList.add(state);
        }
    }
    
    function scrollToSlide(slideIdx) {
        for (let i = 0; i < slideIdx; ++i) {
            setSlideState(allSlides[i], "prev");
        }
        setSlideState(allSlides[slideIdx], "current");
        for (let i = slideIdx + 1; i < slideCount; ++i) {
            setSlideState(allSlides[i], "next");
        }
        if (overviewOpen) {
            closeOverview();
            overviewOpen = false;
        }
    }
    
    window.addEventListener("hashchange", function() {
        currentSlideIdx = slideIdxByHash();
        scrollToSlide(currentSlideIdx);
    });

    document.addEventListener("keyup", function(event) {
        if ((event.keyCode == DEFAULT_SLIDE_ACTION || event.keyCode == NEXT_SLIDE) && currentSlideIdx < slideCount - 1) {
            ++currentSlideIdx;
        } else if (event.keyCode == PREV_SLIDE && currentSlideIdx > 0) {
            --currentSlideIdx;
        } else if (event.keyCode == SHOW_OVERVIEW) {
            if (overviewOpen) {
                closeOverview();
            } else {
                openOverview();
            }
            overviewOpen = !overviewOpen;
        }
        document.location.hash = "#" + (currentSlideIdx + 1);
        
        
    });

});

