# shft

[시프티](https://shiftee.io) 출퇴근을 좀 더 편하게 기록하고 관리하기 위한 도구 모음.

## tools

[cli](https://www.npmjs.com/package/shft-cli)

* https://shiftee.io 에 로그인하고, 토큰정보를 `web` 에 저장합니다.
* `npm i -g shft-cli@latest` 로 설치하고 `shft` 로 실행합니다.

[web](https://shft.chitacan.io)

* `cli` 에서 저장한 토큰을 사용해 출퇴근을 기록하고, 확인할 수 있는 간단한 웹앱입니다.
* 출퇴근 기록을 자동화 할 수 있는 간단한 API 를 지원합니다.

## deploy cli

```
$ cd cli
$ npm run publish
```

## deploy web

```
$ vercel web/ --prod
```
