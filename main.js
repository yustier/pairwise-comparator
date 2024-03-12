let list
const candidates = []
let scores = {}
const matches = []
let match = [null, null]

const btnE = document.querySelector('.button-e')
const btnW = document.querySelector('.button-w')
const remaining = document.querySelector('.remaining')
const league = document.querySelector('.league')
const matchHistory = document.querySelector('.history>tbody')

function writeRanking(method = 'competition') {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
    let ranking = ''
    let lastScore = null
    let rank = 0
    for (const [index, [name, score]] of sortedScores.entries()) {
        switch (method) {
            case 'competition':
            case '1224':
                if (score !== lastScore) {
                    rank = index + 1
                }
                break
            case 'dense':
            case '1223':
                if (score !== lastScore) {
                    rank++
                }
                break
            case 'ordinal':
            case '1234':
                rank = index + 1
                break
        }
        ranking += `<tr><td>${rank}</td><td>${score}</td><td>${name}</td></tr>`
        lastScore = score
    }
    document.querySelector('.rank>tbody').innerHTML = ranking
}

function loadNewMatch() {
    remaining.textContent = matches.length
    if (matches.length === 0) {
        btnE.setAttribute('disabled', null)
        btnW.setAttribute('disabled', null)
        document.querySelector('.button-e>.name').textContent = ''
        document.querySelector('.button-e>.description').textContent = ''
        document.querySelector('.button-e>.remark').textContent = ''
        document.querySelector('.button-w>.name').textContent = ''
        document.querySelector('.button-w>.description').textContent = ''
        document.querySelector('.button-w>.remark').textContent = ''
        return
    }
    match = matches.pop()
    document.querySelector('.button-e>.name').textContent = match[0].name
    document.querySelector('.button-e>.description').textContent = match[0].description
    document.querySelector('.button-e>.remark').textContent = match[0].remark
    document.querySelector('.button-w>.name').textContent = match[1].name
    document.querySelector('.button-w>.description').textContent = match[1].description
    document.querySelector('.button-w>.remark').textContent = match[1].remark
}

function vote(match, hasEastWon) {
    if (hasEastWon) {
        scores[match[0].name]++
    } else {
        scores[match[1].name]++
    }
    writeRanking()

    const newHistory = document.createElement('tr')
    newHistory.innerHTML += `<td>${match[0].name}</td>`
    newHistory.innerHTML += hasEastWon ? '<td>○</td><td>●</td>'
        : '<td>●</td><td>○</td>'
    newHistory.innerHTML += `<td>${match[1].name}</td>`
    if (matchHistory.firstChild.textContent === '対戦が行われていません') {
        matchHistory.removeChild(matchHistory.firstChild)
    }
    matchHistory.insertBefore(newHistory, matchHistory.firstChild)

    const eastIndex = candidates.findIndex(candidate => candidate.name === match[0].name)
    const westIndex = candidates.findIndex(candidate => candidate.name === match[1].name)
    const eastCell = league.querySelector(`tbody>tr:nth-child(${eastIndex + 1})>td:nth-child(${westIndex + 2})`)
    eastCell.textContent = hasEastWon ? '○' : '●'
    const westCell = league.querySelector(`tbody>tr:nth-child(${westIndex + 1})>td:nth-child(${eastIndex + 2})`)
    westCell.textContent = hasEastWon ? '●' : '○'

    loadNewMatch()
}

function init() {
    document.querySelector('h1').innerHTML = list.title.split('\n').join('<br>')
    document.querySelector('.match-type').textContent = list.matchType
    document.querySelector('.score-type').textContent = list.scoreType
    document.querySelector('.candidate-type').textContent = list.candidateType

    candidates.length = 0
    for (const candidate of list.candidates) {
        candidates.push({
            name: candidate.name,
            description: candidate.description,
            remark: candidate.remark
        })
    }

    scores = {}
    for (const candidate of candidates) {
        scores[candidate.name] = 0
    }
    writeRanking()

    matches.length = 0
    for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
            if (Math.random() < 0.5) {
                matches.push([candidates[i], candidates[j]])
            } else {
                matches.push([candidates[j], candidates[i]])
            }
        }
    }
    for (let i = matches.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = matches[i]
        matches[i] = matches[j]
        matches[j] = temp
    }

    remaining.textContent = matches.length

    let newLeague = '<thead><th></th>'
    for (let i = 0; i < candidates.length; i++) {
        newLeague += `<th>${candidates[i].name}</th>`
    }
    newLeague += '</thead><tbody>'
    for (let i = 0; i < candidates.length; i++) {
        newLeague += `<tr><th>${candidates[i].name}</th>`
        for (let j = 0; j < candidates.length; j++) {
            if (i === j) {
                newLeague += '<td>-</td>'
            } else {
                newLeague += '<td></td>'
            }
        }
        newLeague += '</tr>'
    }
    newLeague += '</tbody>'
    league.innerHTML = newLeague

    matchHistory.innerHTML = '<tr><td colspan="4">対戦が行われていません</td></tr>'

    btnE.removeAttribute('disabled')
    btnW.removeAttribute('disabled')

    loadNewMatch()
}

// ドラッグアンドドロップでファイルを読み込む
// const dropZone = document.querySelector('.drop-zone')

// dropZone.addEventListener('drop', (ev) => {
//     console.log("File(s) dropped");
//     ev.preventDefault();

//     if (ev.dataTransfer.items) {
//         if (ev.dataTransfer.items.length !== 1) {
//             return
//         }
//         // Use DataTransferItemList interface to access the file(s)
//         [...ev.dataTransfer.items].forEach((item, i) => {
//             if (item.kind === "file") {
//                 const file = item.getAsFile();
//                 console.log(`… file[${i}].name = ${file.name}`);
//             }
//         });
//     } else {
//         // Use DataTransfer interface to access the file(s)
//         [...ev.dataTransfer.files].forEach((file, i) => {
//             console.log(`… file[${i}].name = ${file.name}`);
//         });
//     }
// })

// dropZone.addEventListener('dragover', (ev) => {
//     console.log("File(s) in drop zone");

//     ev.preventDefault();
// })

// ファイル選択ダイアログでファイルを読み込む
// document.querySelector('#file').addEventListener('change', (ev) => {

// })

const textInput = document.querySelector('#json-text')
textInput.addEventListener('change', (ev) => {
    list = JSON.parse(ev.target.value)
    init()
})

document.mode.addEventListener('change', () => {
    if (document.mode.modeBtn.value === 'main') {
        document.querySelector('.main').style.display = 'block'
        document.querySelector('.config').style.display = 'none'
    }
    if (document.mode.modeBtn.value === 'config') {
        document.querySelector('.main').style.display = 'none'
        document.querySelector('.config').style.display = 'block'
    }
})

btnE.addEventListener('click', () => vote(match, true))
btnW.addEventListener('click', () => vote(match, false))

list = JSON.parse(textInput.value)
init()
