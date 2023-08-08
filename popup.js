const options = 
{
	method: 'GET',
	headers: 
    {
		'X-RapidAPI-Key': '22b76ccc3dmsh6d0f5d62062783fp1212bdjsnf9fcfc027d17',
		'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
	}
};

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

async function getStockData(link)
{
    let val = fetch(link, options).then((response) => response.json());
    return val;
}

function updateStockData(stockSymbol, name, tickSize) 
{
    const stockContainer = document.getElementById('stock-container');
    stockContainer.innerHTML = ''; 

    var label1 = []
    var price_array = []
    var link = "";
    var today = new Date();
    var hours = today.getUTCHours()
    var min = today.getUTCMinutes()
    var time = hours*60+min;
    var size = 0;
    var close = false;

    //Stock market open 13:30 to 20:00
    // 810 - 1200
    if(time >= 1200 || time < 810){
        size = 26
        link = 'https://twelve-data1.p.rapidapi.com/time_series?symbol='+stockSymbol+'&interval=15min&outputsize=26&format=json'
        close = true;
    }
    else if(time < 840){
        size = (time-810)
        let txtsize = size.toString();
        link = 'https://twelve-data1.p.rapidapi.com/time_series?symbol='+stockSymbol+'&interval=1min&outputsize='+txtsize+'&format=json'
    }
    else if(time < 960){
        size = Math.floor((time-810)/5)
        let txtsize = size.toString();
        link = 'https://twelve-data1.p.rapidapi.com/time_series?symbol='+stockSymbol+'&interval=5min&outputsize='+txtsize+'&format=json'
    }
    else if(time > 960){
        size = Math.floor((time-810)/15)
        let txtsize = size.toString();
        link = 'https://twelve-data1.p.rapidapi.com/time_series?symbol='+stockSymbol+'&interval=15min&outputsize='+txtsize+'&format=json'
    }
    
    document.getElementById("date").innerHTML = weekday[today.getDay()]+",    \t    "+(today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear()+",\t"+(today.getHours()+1)+":"+today.getMinutes();
    getStockData(link).then((data) => 
    {            
        for(var i = size-1; i >= 0; i--){
            label1.push(((data["values"][i]["datetime"]).toString()).slice(10,16));

            price_array.push(parseFloat(((data["values"][i]["open"])).toString()).toFixed(2));
        }
        
        const stockDataContainer = document.createElement('div');
        stockDataContainer.classList.add('stock-data');
        
        var t = JSON.stringify(data["values"][0]['datetime'])
        stockDataContainer.innerHTML = `
            <h3 id = "sym"><span><u>${name}:</u>                </span><span style = "color: yellow">${(parseFloat(price_array[price_array.length-1]).toLocaleString())}</span></h3>
            <canvas id="${stockSymbol}-chart"></canvas>
        `;

        stockContainer.appendChild(stockDataContainer);

        var bdcolor = "";
        var bgcolor = "";

        if(price_array[0] > price_array[price_array.length-1]){
            bdcolor = 'rgba(255,55,55,1)';
            bgcolor = 'rgba(255,55,55,.35)';
        }
        else{
            bdcolor = 'rgba(56,191,54,1)';
            bgcolor = 'rgba(56,191,54,.35)';
        }

        const dailyMovementChart = new Chart(`${stockSymbol}-chart`, {
            type: 'line',
            data: {
                labels: label1,
                datasets: [
                    {
                        label: name,
                        data: price_array,
                        borderColor: bdcolor,
                        backgroundColor: bgcolor,
                        fill: true
                        
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales:{
                    x:{
                        grid:{
                            color: 'lightgray'
                        },
                        ticks:{
                            color: 'lightgray'
                        }
                    },
                    y:{
                        grid:{
                            color: 'lightgray'
                        },
                        ticks:{
                            stepSize:tickSize,
                            color: 'lightgray'
                        }
                        
                    }
                }
            },
        });
    })
    .catch((error) => 
    {
        console.error("Error:", error);
    });
}  

document.addEventListener('DOMContentLoaded', () =>
 {
  updateStockData('GSPC', "S&P 500", 10);
  updateStockData('IXIC', "NASDAQ", 50);
  updateStockData('DJI', "Dow Jones", 150);
});
