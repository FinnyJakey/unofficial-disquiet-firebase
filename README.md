# unofficial-disquiet-firebase

✽ Disquiet Firebase (Database/Function)



### Firestore

```
(Collection) +-- (Document) +-- Field

+-- maker_logs
|   +-- logs
|   |   +-- 0
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19592
|   |   |   +-- "is_new": true
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@@@"
|   |   +-- 1
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19591
|   |   |   +-- "is_new": false
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@@"
|   |   +-- 2
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19590
|   |   |   +-- "is_new": false
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@"
|   +-- logs_for_following
|   |   +-- 0
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19592
|   |   |   +-- "is_new": true
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@@@"
|   |   +-- 1
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19591
|   |   |   +-- "is_new": false
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@@"
|   |   +-- 2
|   |   |   +-- "display_name": "String"
|   |   |   +-- "id": 19590
|   |   |   +-- "is_new": false
|   |   |   +-- "title": "String"
|   |   |   +-- "url": "https://disquiet.io/@moonmi34/makerlog/@"
```

```
(Collection) +-- (Document) +-- Field

+-- notification
|   +-- following_maker_logs
|   |   +-- finny_jakey
|   |   |   +-- [0] "device_token"
|   |   |   +-- [1] "device_token1"
|   |   |   +-- [2] "device_token2"
|   |   +-- others
|   |   |   +-- [0] "device_token"
|   +-- new_maker_logs
|   |   +-- device_tokens
|   |   |   +-- [0] "device_token"
|   |   |   +-- [1] "device_token1"
|   |   |   +-- [2] "device_token2"
|   |   |   +-- [3] "device_token3"
|   |   |   +-- [4] "device_token4"
```

```
(Collection) +-- (Document) +-- Field

+-- user
|   +-- device_token
|   |   +-- following
|   |   |   +-- [0] "finny_jakey"
|   |   |   +-- [1] "others"
|   |   +-- following_maker_logs: true
|   |   +-- new_maker_logs: true
```

```
(Collection) +-- (Document) +-- Field

+-- version
|   +-- version
|   |   +-- version: "1.0.0"
```



### Function

package.json dependencies
```
"dependencies": {
  "axios": "^1.6.2",
  "firebase-admin": "^11.8.0",
  "firebase-functions": "^4.3.1"
},
```

```
getMakerLogsPeriodic() -> 30분 간격으로 New Maker Logs 파싱 및 DB 저장
sendNewMakerLogNotification() -> 1시간 간격으로 새로운 메이커 로그 알림을 등록한 사람에게 push notification 전송
sendFollowingMakerLogNotification() -> 1시간 간격으로 팔로잉 메이커 로그 알림을 등록한 사람에게 push notification 전송
```

