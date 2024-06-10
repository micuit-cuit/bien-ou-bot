const  { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { promises: fs } = require("fs");
/*[
  {
    "date": "2024-02-20",
    "moods": {
      "happy": {
        "count": 12,
        "commentsCount": 4,
        "totalVotes": 0
      },
      "neutral": {
        "count": 5,
        "commentsCount": 3,
        "totalVotes": 0
      },
      "sad": {
        "count": 1,
        "commentsCount": 1,
        "totalVotes": 0
      }
    }
  },
]*/
async function generateChart(moods){
    //trie la liste des moods par date
    // moods.sort((a, b) => {
    //     if (a.date === b.date) {
    //         return 0;
    //     }
    //     if (a.date == undefined) {
    //         return -1;
    //     }
    //     if (b.date == undefined) {
    //         return 1;
    //     }   
    //     let dateA = a.date.split('-')
    //     let dateB = b.date.split('-')
    //     return dateA[0] - dateB[0] || dateA[1] - dateB[1] || dateA[2] - dateB[2]
    // });
    // moods.forEach((mood) => {
    //     console.log(mood.date);
    // })
    const width = 1920;
    const height = 1080;
    const config = {
        type: "line",
        data: {
            labels: moods.map((mood) => mood.date),
            datasets: [
                {
                    label: "happy",
                    data: moods.map((mood) => mood.moods.happy.count),
                    borderColor: "#00CA7D",
                    borderWidth: 5,
                },
                {
                    label: "happy comments",
                    data: moods.map((mood) => mood.moods.happy.commentsCount),
                    borderColor: "#00CA7D",
                    borderCapStyle: "round",
                    borderDash: [5, 5],
                    borderWidth: 3,
                },
                {
                    label: "happy total votes",
                    data: moods.map((mood) => mood.moods.happy.totalVotes),
                    borderColor: "#00CA7D",
                    borderCapStyle: "round",
                    borderDash: [5, 10],
                    borderWidth: 1,
                },

                {
                    label: "neutral",
                    data: moods.map((mood) => mood.moods.neutral.count),
                    borderColor: "#FFD700",
                    borderWidth: 5,
                },
                {
                    label: "neutral comments",
                    data: moods.map((mood) => mood.moods.neutral.commentsCount),
                    borderColor: "#FFD700",
                    borderCapStyle: "round",
                    borderDash: [5, 5],
                    borderWidth: 3,
                },
                {
                    label: "neutral total votes",
                    data: moods.map((mood) => mood.moods.neutral.totalVotes),
                    borderColor: "#FFD700",
                    borderCapStyle: "round",
                    borderDash: [5, 10],
                    borderWidth: 1,
                },

                {
                    label: "sad",
                    data: moods.map((mood) => mood.moods.sad.count),
                    borderColor: "#FF0000",
                    borderWidth: 5,
                },
                {
                    label: "sad comments",
                    data: moods.map((mood) => mood.moods.sad.commentsCount),
                    borderColor: "#FF0000",
                    borderCapStyle: "round",
                    borderDash: [5, 5],
                    borderWidth: 3,
                },
                {
                    label: "sad total votes",
                    data: moods.map((mood) => mood.moods.sad.totalVotes),
                    borderColor: "#FF0000",
                    borderCapStyle: "round",
                    borderDash: [5, 10],
                    borderWidth: 1,
                },

                // total couleurs bleu
                {
                    label: "total",
                    data: moods.map((mood) => mood.moods.happy.count + mood.moods.neutral.count + mood.moods.sad.count),
                    borderColor: "#0000FF",
                    borderWidth: 5,
                },
                {
                    label: "total comments",
                    data: moods.map((mood) => mood.moods.happy.commentsCount + mood.moods.neutral.commentsCount + mood.moods.sad.commentsCount),
                    borderColor: "#0000FF",
                    borderCapStyle: "round",
                    borderDash: [5, 5],
                    borderWidth: 3,
                },
                {
                    label: "total total votes",
                    data: moods.map((mood) => mood.moods.happy.totalVotes + mood.moods.neutral.totalVotes + mood.moods.sad.totalVotes),
                    borderColor: "#0000FF",
                    borderCapStyle: "round",
                    borderDash: [5, 10],
                    borderWidth: 1,
                },

            ],
        },
        options: {
            // scales: {
            //     y: {
            //         beginAtZero: true,
                    
            //     },
            // },
            plugins: {
                title: {
                  display: true,
                  text: 'Tracker d\'humeur',
                }
            }
        },
    };
    const chartCallback = (ChartJS) => {
        ChartJS.defaults.color = "#fff";
        ChartJS.defaults.font.size = 16;
        ChartJS.defaults.font.family = "Arial";
    }
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback,
    });
    return await chartJSNodeCanvas.renderToBuffer(config);
}

module.exports = generateChart;