const logger = require("firebase-functions/logger");
const { pubsub } = require("firebase-functions");
const { getFirestore } = require('firebase-admin/firestore');
const axios = require("axios");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { messaging } = require("firebase-admin");

initializeApp({
    credential: applicationDefault()
});

const db = getFirestore();
const endpoint = "https://api.disquiet.io/graphql";

exports.getMakerLogsPeriodic = pubsub.schedule("0,30 0-23 * * *").onRun(async (context) => {
    let variables = {
        "offset": 0,
        "limit": 12,
        "sortOption": "recent",
        "type": "maker_log"
    };

    let query = `
    query GetPosts($offset: Int, $limit: Int, $sortOption: String, $type: String, $period: String) {
      posts(
        offset: $offset
        limit: $limit
        sortOption: $sortOption
        type: $type
        period: $period
      ) {
        __typename
        ... on MakerLog {
          id
          user {
            id
            display_name
            username
            __typename
          }
          title
          url_slug
        }
      }
    }
    `;

    axios.post(endpoint, {
        query,
        variables,
    }).then(async (axiosResponse) => {
        let logs = axiosResponse.data.data.posts;
        let savedLogs = (await db.collection("maker_logs").doc("logs").get()).data().logs;

        let toSaveLogs = [];

        for (let log of logs) {
            if (!savedLogs.find(savedLog => savedLog.id === log.id)) {
                toSaveLogs.push({
                    "id": log.id,
                    "display_name": log.user.display_name,
                    "username": log.user.username,
                    "title": log.title  ?? "",
                    "url": "https://disquiet.io/@" + log.user.username + "/makerlog/" + log.url_slug,
                    "is_new": true
                });
            }
        }

        for (let _ in toSaveLogs) {
            savedLogs.pop();
        }

        let combinedArray = [...toSaveLogs, ...savedLogs];

        let logsRef = db.collection("maker_logs").doc("logs");
        let logsForFollowingRef = db.collection("maker_logs").doc("logs_for_following");

        await logsRef.set({
            "logs": combinedArray,
        });

        await logsForFollowingRef.set({
            "logs": combinedArray,
        });

    }).catch((error) => {
        console.error('getMakerLogsPeriodic 요청 실패:', error);
        logger.error('getMakerLogsPeriodic 요청 실패:', error);
    });

});

exports.sendNewMakerLogNotification = pubsub.schedule("0 * * * *").onRun(async (context) => {
    let logsRef = db.collection("maker_logs").doc("logs");

    let data = await logsRef.get();

    let reversedLogs = [...data.data()["logs"]].reverse();

    for (let log of reversedLogs) {
        if (log["is_new"]) {
            let message = {
                notification: {
                    title: `${log["display_name"]}님이 새로운 메이커 로그를 작성했어요!`,
                    body: log["title"]
                },
                data: {
                    link: log['url']
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "default"
                        }
                    }
                },
            };

            let newMakerLogsRef = db.collection("notification").doc("new_maker_logs");

            let data = await newMakerLogsRef.get();

            let toSendTokens = data.data()["device_tokens"];

            if (!toSendTokens || toSendTokens.length === 0) {
                toSendTokens = ['device_token_for_non_array_new_maker_log'];
            }

            let multicastMessage = {
                tokens: toSendTokens,
                notification: message.notification,
                data: message.data,
                apns: message.apns
            };

            messaging().sendEachForMulticast(multicastMessage)
                .catch((error) => {
                    console.error("Error sending FCM message:", error);
                    logger.error("Error sending FCM message:", error);
                });
        }
    }

    let sameLogs = [...reversedLogs].reverse();

    const updatedLogsArray = sameLogs.map(log => ({
        ...log,
        is_new: false
    }));

    await logsRef.set({
        "logs": updatedLogsArray,
    });
});

exports.sendFollowingMakerLogNotification = pubsub.schedule("0 * * * *").onRun(async (context) => {
    let logsForFollowingRef = db.collection("maker_logs").doc("logs_for_following");

    let data = await logsForFollowingRef.get();

    let reversedLogs = [...data.data()["logs"]].reverse();

    for (let log of reversedLogs) {
        if (log["is_new"]) {
            let notificationFollowingMakerLogs = db.collection("notification").doc("following_maker_logs");
            let followingsData = await notificationFollowingMakerLogs.get();

            if (followingsData.data() && followingsData.data().hasOwnProperty(log["username"])) {
                let message = {
                    notification: {
                        title: `${log["display_name"]}님이 새로운 메이커 로그를 작성했어요!`,
                        body: log["title"]
                    },
                    data: {
                        link: log['url']
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: "default"
                            }
                        }
                    },
                };

                let toSendTokens = followingsData.data()[log["username"]];

                for (let toSendToken of toSendTokens) {
                    let userData = await db.collection("user").doc(toSendToken).get();
                    let isFollowingMakerLogs = userData.data()["following_maker_logs"];

                    if (!isFollowingMakerLogs) {
                        let index = toSendTokens.indexOf(toSendToken);

                        if (index !== -1) {
                            toSendTokens.splice(index, 1);
                        }
                    }
                }

                if (!toSendTokens || toSendTokens.length === 0) {
                    toSendTokens = ['device_token_for_non_array_following_maker_log'];
                }

                let multicastMessage = {
                    tokens: toSendTokens,
                    notification: message.notification,
                    data: message.data,
                    apns: message.apns
                };

                messaging().sendEachForMulticast(multicastMessage)
                    .catch((error) => {
                        console.error("Error sending FCM message:", error);
                        logger.error("Error sending FCM message:", error);
                    });
            }
        }
    }

    let sameLogs = [...reversedLogs].reverse();

    const updatedLogsArray = sameLogs.map(log => ({
        ...log,
        is_new: false
    }));

    await logsForFollowingRef.set({
        "logs": updatedLogsArray,
    });
});
