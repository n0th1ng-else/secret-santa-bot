import { LanguageCode } from "./types";

export enum LabelId {
  NoContent,
  WelcomeMessage,
  EventMessage,
  NoEventsMessage,
  EventListMessage,
  RelationNotFound,
  MyBuddyBtn,
  EventLinkBtn,
  ActivateBtn,
  ShareTitleText,
  ShareNameText,
  ShareBudgetText,
  ShareLinkText,
  JoinedEventText,
  EmptyAgentText,
  AgentTitleText,
  AlreadyActive,
  ActivatedText,
  DeliveryText,
  ParticipantsBtn,
  StartCommandDescription,
  EventCommandDescription,
  ListCommandDescription,
}

export const labels = {
  [LanguageCode.Ru]: {
    [LabelId.NoContent]: "no content",
    [LabelId.WelcomeMessage]:
      "Привет! Я помогу вам сыграть в Тайного Санту. Создавайте розыгрыш, а я назначу Санту для каждого из участников.",
    [LabelId.EventMessage]:
      "Давай создадим новую группу для Тайного Санты!\nМне нужно название розыгрыша, чтобы вы точно знали, о чем идет речь. Отправь мне пару слов:",
    [LabelId.NoEventsMessage]:
      "Вы не участвовали ни в одном розыгрыше Тайного Санты.\nМожете создать новую группу с помощью команды /event",
    [LabelId.EventListMessage]:
      "Список последних розыгрышей Тайного Санты. Группы, созданные вами, помечены 🌚",
    [LabelId.RelationNotFound]: "Событие не найдено",
    [LabelId.MyBuddyBtn]: "Кому я дарю подарок? 🦹🏻",
    [LabelId.EventLinkBtn]: "Поделиться ссылкой на группу 🤜🏻🤛🏻",
    [LabelId.ActivateBtn]: "Разыграть Тайного Санту! ‍🚀️",
    [LabelId.ShareTitleText]: "Участвуй в розыгрыше Тайного Санты!",
    [LabelId.ShareNameText]: "Розыгрыш:",
    [LabelId.ShareBudgetText]: "Бюджет:",
    [LabelId.ShareLinkText]: "Присоединяйся по ссылке:",
    [LabelId.JoinedEventText]: "Ты участвуешь!",
    [LabelId.EmptyAgentText]: "Тайный Санта не активирован!",
    [LabelId.AgentTitleText]: "Твоя цель:",
    [LabelId.AlreadyActive]: "Розыгрыш уже совершен!",
    [LabelId.ActivatedText]:
      "Тайный Санта активирован! Скоро вы получите свою цель.\nВы всегда можете посмотреть детали в подробностях розыгрыша с помощью команды /list",
    [LabelId.DeliveryText]: "TODO",
    [LabelId.ParticipantsBtn]: "Участники 💃🏻🕺🏻",
  },
  [LanguageCode.En]: {
    [LabelId.StartCommandDescription]: "Say hello and see bot info",
    [LabelId.EventCommandDescription]: "Create a new Secret Santa group",
    [LabelId.ListCommandDescription]:
      "See the groups and activate Secret Santa",
  },
};
