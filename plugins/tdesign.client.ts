import { defineNuxtPlugin } from "#app";
import { Button, Switch, Loading } from "tdesign-vue-next";
import {
  Chat as TChat,
  ChatSender as TChatSender,
  ChatItem as TChatItem,
  ChatContent as TChatContent,
  ChatAction as TChatAction,
  ChatInput as TChatInput,
} from "@tdesign-vue-next/chat";

export default defineNuxtPlugin((nuxtApp) => {
  // 注册 TDesign 基础组件
  nuxtApp.vueApp.component("TButton", Button);

  // 注册 TDesign Chat 组件
  nuxtApp.vueApp.component("TChat", TChat);
  nuxtApp.vueApp.component("TChatSender", TChatSender);
  nuxtApp.vueApp.component("TChatItem", TChatItem);
  nuxtApp.vueApp.component("TChatContent", TChatContent);
  nuxtApp.vueApp.component("TChatAction", TChatAction);
  nuxtApp.vueApp.component("TChatInput", TChatInput);
  nuxtApp.vueApp.component("TSwitch", Switch);
  nuxtApp.vueApp.component("TLoading", Loading);
});
