// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



const pathArray = window.location.pathname.split('/');
const id = pathArray[pathArray.length - 1];

let currentStats = null;

let updates = localStorage.getItem("retention/" + id) || "[]";
updates = JSON.parse(updates);

async function load() {


    const cardLabels = document.querySelectorAll(".card-label");

    cardLabels.forEach(label => {
        if (label.textContent.trim() === 'User retention table') {

            let parent = label.parentElement;

            let existing = parent.querySelector('.extended-stats');
            if (existing)
                existing.remove();

            let statButtons = document.createElement("div");
            statButtons.classList.add("extended-stats");
            statButtons.style = "display:flex; flex-direction:row; gap: 10px;"

            let previousTimeDiffs = {};

            for (let i = 0; i < updates.length; i++) {

                let update = updates[i];

                if (!update)
                    continue;

                let lastUpdate = update.lastUpdate;
                if (!lastUpdate)
                    continue;
                let button = document.createElement('button');
                button.classList.add("btn-primary");
                button.classList.add("btn");
                button.classList.add("xstats-btn");

                let now = Date.now();
                let diff = now - lastUpdate;

                let seconds = diff / 1000;
                let minutes = seconds / 60;
                let hours = minutes / 60;
                let days = hours / 24;

                let timeDesc = "";

                let previousUpdate = i > 0 ? updates[i - 1].lastUpdate : 0;
                let previousDiff = lastUpdate - previousUpdate;
                let previousDiffMinutes = (previousDiff / 1000) / 60;

                if (days > 1 || hours > 20) {
                    let numDay = Math.round(days);
                    let strDay = numDay == 1 ? 'day' : 'days';
                    timeDesc = numDay + ' ' + strDay + ' ago'
                }
                else if (hours >= 1) {
                    if (hours > 16 && hours <= 20) {
                        timeDesc = "20 hours ago"
                    } else if (hours > 12 && hours <= 16) {
                        timeDesc = "16 hours ago"
                    } else if (hours > 8 && hours <= 12) {
                        timeDesc = "12 hours ago"
                    } else if (hours > 5 && hours <= 8) {
                        timeDesc = "8 hours ago"
                    } else if (hours > 3 && hours <= 5) {
                        timeDesc = "5 hours ago"
                    } else if (hours >= 2 && hours <= 3) {
                        timeDesc = "a few hours ago";
                    } else {
                        timeDesc = Math.round(hours) + ' hours ago';
                    }
                }
                else if (minutes > 5 && previousDiffMinutes >= 5) {
                    timeDesc = Math.round(minutes) + ' minutes ago';
                }
                else {
                    continue;
                }
                // else if (seconds > 0) {
                //     continue;
                //     timeDesc = Math.round(seconds) + ' seconds ago';
                // }

                if (timeDesc in previousTimeDiffs)
                    continue;

                previousTimeDiffs[timeDesc] = true;

                button.textContent = timeDesc;
                button.onclick = (e) => {

                    let btns = document.querySelectorAll('.xstats-btn');
                    btns.forEach(btn => {
                        btn.classList.remove('btn-primary');
                        btn.classList.remove('btn-warning');
                        btn.classList.add('btn-primary');
                    })
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-warning');

                    updateTableStats(update.stats)
                };
                statButtons.append(button);
            }


            parent.appendChild(statButtons);

        }
    })


    updateTableStats();
}



const updateTableStats = (historyStats) => {

    let tablerows = document.querySelectorAll(".table-responsive .table tbody tr");

    let stats = {};

    for (let i = 0; i < tablerows.length; i++) {
        let row = tablerows[i];

        if (row.children.length < 3)
            return;

        let title = row.children[0].textContent.trim();
        let views = Number.parseInt(row.children[1].textContent.trim());
        if (currentStats && (title in currentStats)) {
            views = currentStats[title];
        }

        if (historyStats) {

            if (title in historyStats) {
                let diff = views - historyStats[title]
                if (diff > 0)
                    row.children[1].innerHTML = views + ' <span class="text-success bold">+' + diff + "</span>";
                else {
                    row.children[1].innerHTML = views + "";
                }
            }
            else {
                row.children[1].innerHTML = views + "";
            }

        }
        // let userret = row.children[2].textContent.trim();
        // let membernum = row.children[3].textContent.trim();
        // let memberpct = row.children[4].textContent.trim();

        stats[title] = views;

    }

    if (!currentStats)
        currentStats = stats;

    if (!historyStats) {

        updates.push({
            lastUpdate: Date.now(),
            stats
        })

        updates.sort((a, b) => {
            return a.lastUpdate - b.lastUpdate;
        })

        localStorage.setItem("retention/" + id, JSON.stringify(updates));
    }

}


load();

// const article = document.querySelector("article");

// // `document.querySelector` may return null if the selector doesn't match anything.
// if (article) {
//     const text = article.textContent;
//     /**
//      * Regular expression to find all "words" in a string.
//      *
//      * Here, a "word" is a sequence of one or more non-whitespace characters in a row. We don't use the
//      * regular expression character class "\w" to match against "word characters" because it only
//      * matches against the Latin alphabet. Instead, we match against any sequence of characters that
//      * *are not* a whitespace characters. See the below link for more information.
//      *
//      * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
//      */
//     const wordMatchRegExp = /[^\s]+/g;
//     const words = text.matchAll(wordMatchRegExp);
//     // matchAll returns an iterator, convert to array to get word count
//     const wordCount = [...words].length;
//     const readingTime = Math.round(wordCount / 200);
//     const badge = document.createElement("p");
//     // Use the same styling as the publish information in an article's header
//     badge.classList.add("color-secondary-text", "type--caption");
//     badge.textContent = `⏱️ ${readingTime} min read`;

//     // Support for API reference docs
//     const heading = article.querySelector("h1");
//     // Support for article docs with date
//     const date = article.querySelector("time")?.parentNode;

//     // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
//     (date ?? heading).insertAdjacentElement("afterend", badge);
// }