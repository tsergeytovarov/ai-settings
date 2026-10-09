# sounds

Плагин Claude Code: короткий звук, когда сессии нужен человек. Можно уйти в другое окно и вернуться на звук.

| Звук | Когда |
| --- | --- |
| `done.wav`, звонкая капля | ход закончился ответом: ответ дописан |
| `ask.wav`, «кря-кря» живой кряквы | модель задала вопрос (`AskUserQuestion`), принесла план на одобрение (`ExitPlanMode`) или открылся диалог разрешения |
| `alarm.wav` в плагине `fuse`, короткая сирена | сработал предохранитель |

Молчит:
- когда ход остановил сам человек: он и так смотрит;
- на ходах субагентов: это часть работы, а не ответ;
- в автозадачах: слушать некому;
- на вопросе предохранителя: тот играет свою тревогу.

Звук играет движок через `afplay`, поэтому работает на macOS. Ход и диалог звука не ждут.

## Звуки

Каплю и сирену синтезирует скрипт:

```bash
cd ~/work/ai-settings/plugins
python3 sounds/scripts/make_sounds.py
```

Он пишет `sounds/sounds/done.wav` и `fuse/sounds/alarm.wav`. Чтобы поменять звук, правь рецепт в скрипте и запусти его заново.

`ask.wav` — запись кряквы: Jonathon Jongsma, [xeno-canto XC62258](https://www.xeno-canto.org/62258), лицензия [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), взята с Wikimedia Commons. Из записи вырезан отрезок 1,16–2,02 с, срезан гул ниже 150 Гц, края сглажены, громкость выровнена. Этот файл распространяется под той же лицензией CC BY-SA 3.0:

```bash
ffmpeg -i "Anas_platyrhynchos_-_Mallard_-_XC62258.ogg" -ac 1 -ar 44100 mallard.wav
ffmpeg -i mallard.wav -af "atrim=1.16:2.02,asetpts=PTS-STARTPTS,highpass=f=150,afade=t=in:d=0.01,afade=t=out:st=0.82:d=0.04,loudnorm=I=-16:TP=-2:LRA=7" -ar 44100 -ac 1 sounds/ask.wav
```

## Установка

```bash
claude plugin marketplace update popovs-plugins
claude plugin install sounds@popovs-plugins
```

## Разработка

- `hooks/register.ts` — хуки `turn.complete`, `tool.call`, `classic.PermissionRequest`, `prompt.submit`.
- Проверка: `claude plugin validate .` и `claude plugin test .`
