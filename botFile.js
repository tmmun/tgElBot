const { ipcRenderer } = require("electron")
const fs = require('fs')
window.$ = window.jQuery = require('jquery');
const TelegramApi = require('node-telegram-bot-api')

let token = ''
let bot


{//save file

    let fileCount = 0

    fileList()

    $(".saveText").click(function () {

        if ($('.saveNameInp').val() != '' && $('.saveTextInp').val() != '' && fileCount < 5) {//проверям есть ли текст в saveNameInp и saveTextInp, а так же fileCount
            let saveName = 'base/' + $('.saveNameInp').val() + '.txt'
            let saveText = $('.saveTextInp').val()

            fs.writeFile(saveName, saveText, (err) => {//записываем текст в файл
                if (err) console.log(err)
                fileList()
            })
        }

    })

    $(".readText").click(function () {

        if ($('.saveNameInp').val() != '') {//проверяем указанно ли название
            try {
                let saveName = 'base/' + $('.saveNameInp').val() + '.txt'
                let fileContent = fs.readFileSync(saveName, 'utf8')//отображаем содержимое файла в saveTextInp
                $('.saveTextInp').val(fileContent)
            } catch (error) {
                $('.saveNameInp').val('файла нет')//если название не верное
            }
        }

    })

    $(".delText").click(function () {

        if ($('.saveNameInp').val() != '') {
            let saveName = 'base/' + $('.saveNameInp').val() + '.txt'

            fs.unlink(saveName, err => {//удаляем файл по названиею
                try {
                    if (err) throw err
                } catch (error) {
                    $('.saveNameInp').val('нет файла')//если название не верное
                }
                fileList()
            })
        }

    })

    function fileList() {//отображаем название файлов

        fs.readdir('base', (err, data) => {//тут мы выводим название всех файлов в fileContб через forEach => file

            fileCount = data.length

            if (data != '') {
                let text = ''

                data.forEach(file => {
                    text += file + '\n'
                })

                $('.fileCont').text(text)
            }
        })
    }

}

{//token interval

    let botStart = false
    let tokenAdd = false

    fs.readFile('token.txt', 'utf-8', (err, data) => {//помещаем в инпут токен из txt если он есть

        if (data != '') {
            $('.tokenInp').val(data)
        }
    })

    $(".token").click(function () {//работа с токеном

        if (tokenAdd == false && $('.tokenInp').val() != '') {
            token = $('.tokenInp').val()//записываем токен из инпута

            bot = new TelegramApi(token, { polling: true })

            bot.on('message', msg => {//получаем сообщения

                const chatId = msg.chat.id
                console.log(msg.text)

                if (msg.text) {//если нам написали текствое смс
                    $('.section').append('<div id="profile"><img id="icoProf" src="ico/prof.svg" alt=""><div id="textProf">' + msg.chat.first_name + ' ' + msg.chat.last_name + '</div><img id="icoProf" src="ico/log.svg" alt=""><div id="textProf">' + msg.chat.username + '</div><img id="icoProf" src="ico/id.svg" alt=""><div id="textProf">' + msg.chat.id + '</div></div><div id="message"> ' + msg.text + '</div>')
                }
                if (msg.photo) {//если нам отправили фото

                    let url = `https://api.telegram.org/bot${token}/getFile?file_id=${msg.photo[2].file_id}`//шаблон

                    async function getResponce() {//асинхронная функция
                        let res = await fetch(url)//помещаем в url данные через fetch
                        let content = await res.json()//преобразовываем в json
                        let photoLink = `https:// api.telegram.org/file/bot${token}/${content.result.file_path}`//вставляем в шаблон
                        $('.section').append('<div id="profile"><img id="icoProf" src="ico/prof.svg" alt=""><div id="textProf">' + msg.chat.first_name + ' ' + msg.chat.last_name + '</div><img id="icoProf" src="ico/log.svg" alt=""><div id="textProf">' + msg.chat.username + '</div><img id="icoProf" src="ico/id.svg" alt=""><div id="textProf">' + msg.chat.id + '</div></div><div id="message"> ' + photoLink + '</div>')
                    }

                    getResponce()
                }
                if (msg.video) {

                    console.log('video')
                }
                else {

                }

                if (msg.text === 'start') {//ответ на заготовленное сообщение(тест)
                    bot.sendMessage(chatId, 'Привет, скоро буду)')
                }
            })

            fs.writeFile('token.txt', token, (err) => {//сохраняем токен в txt
                if (err) console.log(err)
            })

            botStart = true
            tokenAdd = true

        }
    })
}

{//post interval
    let messageInterval
    let intervalCount = 2000

    let messageStart = false
    let messageSwichCount = 3
    let messageSwichArr = ['txt', 'img', 'stk', 'vid']
    let mSwichI = 0

    let postArrSwich = false
    let postArr = []
    let postArrI = 0

    $(".sendMsg").click(function () {
        checkText()
    })

    $(".startPost").click(function () {

        if (messageStart === false) {
            if ($('.intervalCount').val() <= 1000) {//если кол-во секунд меньше 1 ставим 2

                intervalCount = 2000

            }
            else {
                intervalCount = $('.intervalCount').val()//ставим кол-во секунд указанное в intervalCount инпуте
            }

            messageInterval = setInterval(function () {//пишем с интервалом
                if (postArrSwich) {
                    checkArr()
                }
                else {
                    checkText()
                }
            }, intervalCount);//время ожидания

        }

        messageStart = true
    })

    $(".stopPost").click(function () {
        clearInterval(messageInterval)//останавливаем интервал
        messageStart = false
        postArrI = 0
    })

    $("#swich").click(function () {
        if (mSwichI < messageSwichCount) {//меняем тип отправляемого сообщения
            messageSwichArr[mSwichI]//масив с названиями для кейсов
            mSwichI++
        }
        else {
            mSwichI = 0
            messageSwichArr[mSwichI]
        }

        $('#swich').text(messageSwichArr[mSwichI])
        console.log(messageSwichArr[mSwichI]);
    })

    $(".arrPost").click(function () {

        if (postArrSwich) {//выбираем тип постов - обычный текст или заготовленный файл
            postArrSwich = false
            $('.arrPost').text('msg')
        }
        else {
            postArrSwich = true
            $('.arrPost').text('arr')
        }
    })

    function checkText() {
        if ($('.postChatId').val() != null && $('.postText').val() != '') {//поверяем указан ли id комнаты и текст в input
            switch (messageSwichArr[mSwichI]) {
                case 'txt': bot.sendMessage($('.postChatId').val(), $('.postText').val())//отправка текста
                    $('.postText').val('')
                    break

                case 'img': let result = $('.postText').val().match(/png|jpg/)//отправка кавтинки

                    if (result == null) {//если нет ключевых png|jpg то пишем 'это не фото' и стопаем интервал
                        $('.postText').val('это не фото')
                        clearInterval(messageInterval)
                        messageStart = false
                    }
                    else {//публикуем фото
                        bot.sendPhoto($('.postChatId').val(), $('.postText').val())
                        $('.postText').val('')
                    }
                    break

                case 'stk': bot.sendSticker($('.postChatId').val(), $('.postText').val())//отправка стикера
                    $('.postText').val('')
                    break

                case 'vid': let resultVid = $('.postText').val().match(/mp4|avi|youtube/)//отправка текставидео

                    if (resultVid == null) {//если нет ключевых mp4|AVI то пишем 'это не видео' и стопаем интервал
                        $('.postText').val('это не видео')
                        clearInterval(messageInterval)
                        messageStart = false
                    }
                    else {//публикуем видео
                        bot.sendVideo($('.postChatId').val(), $('.postText').val())
                        $('.postText').val('')
                    }
                    break
            }
        }

    }

    function checkArr() {
        if ($('.postChatId').val() != null && $('.fileNameInp').val() != '' && token != '') {//поверяем указан ли id комнаты и текст в input
            let saveName = 'base/' + $('.fileNameInp').val() + '.txt'

            fs.readFile(saveName, 'utf-8', (err, data) => {//отправляем заготовленный контент из txt

                try {
                    postArr = data.split(',')//режим data в наш масив
                    $('.postText').val(postArr[postArrI])//помещаем значение в инпут
                    checkText()//отправляем
                    postArrI++

                    if (postArrI >= postArr.length) {//останавливаем - сравниваем кол-во отправленного контента и дл масива
                        clearInterval(messageInterval)
                        messageStart = false
                        postArrI = 0
                    }
                } catch (error) {
                    $('.fileNameInp').val('неправильное название')//если названеи файла неправильное
                }
            })
        }

    }

}

$(".close").click(function () {
    ipcRenderer.send('close')//закрываем окно
})

$(".min").click(function () {
    ipcRenderer.send('minimize')//сварачиваем окно
})

function postImg() {
    const dir = 'img'

    fs.readdir('img', (err, data) => {

        data.forEach(file => {
            bot.sendPhoto($('.postChatId').val(), fs.readFileSync('img/' + file))//отправляем фото из папки
        })

        fs.readdir(dir, (err, files) => {//содержимое файла
            if (err) {
                console.error(err)
                return
            }
            console.log(files)
        })
    })
}

//console.log()
//$('').append("<div")
//$("").click(function () {} )