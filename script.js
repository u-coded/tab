// セレクターの定義
const TAB_SEL = "[data-tab]"; // タブのセレクター
const TABLIST_SEL = "[data-tablist]"; // タブリストのセレクター
const TABPANEL_SEL = "[data-tabpanel]"; // タブパネルのセレクター
const TABSET_SEL = "[data-tabset]"; // タブセット（親要素）のセレクター
const SHOW_CLASS = "is-show"; // 表示中のタブパネルに付与するクラス

const tabTriggers = document.querySelectorAll(TAB_SEL); // すべてのタブを取得

// タブをアクティブにする関数
const activateTab = (newTab) => {
  const tabSet = newTab.closest(TABSET_SEL); // 現在のタブが属する親タブセットを取得
  const tabs = tabSet.querySelectorAll(TAB_SEL); // 親タブセット内のすべてのタブを取得
  const tabPanels = tabSet.querySelectorAll(TABPANEL_SEL); // 対応するタブパネルを取得

  // すべてのタブとパネルの状態を更新
  tabs.forEach((tab) => {
    tab.setAttribute("aria-selected", tab === newTab ? "true" : "false"); // 選択状態を更新
    tab.setAttribute("tabindex", tab === newTab ? "0" : "-1"); // フォーカス可能かどうかを設定
  });

  tabPanels.forEach((panel) => {
    if (panel.getAttribute("aria-labelledby") === newTab.id) {
      panel.hidden = false; // 対応するパネルを表示
      panel.classList.add(SHOW_CLASS); // 表示中のパネルにクラスを追加

      // 子タブセットの処理
      const childTabSet = panel.querySelector(TABSET_SEL);
      if (childTabSet) {
        const firstChildTab = childTabSet.querySelector(TAB_SEL);
        if (firstChildTab) {
          firstChildTab.setAttribute("aria-selected", "true"); // 最初の子タブを選択状態にする
          firstChildTab.setAttribute("tabindex", "0"); // フォーカス可能にする

          // 子タブに対応するパネルを表示
          const childTabPanels = childTabSet.querySelectorAll(TABPANEL_SEL);
          childTabPanels.forEach((childPanel) => {
            if (
              childPanel.getAttribute("aria-labelledby") === firstChildTab.id
            ) {
              childPanel.hidden = false; // 子タブパネルを表示
              childPanel.classList.add(SHOW_CLASS);
            } else {
              childPanel.hidden = true; // 他の子タブパネルを非表示
              childPanel.classList.remove(SHOW_CLASS);
            }
          });
        }
      }
    } else {
      panel.hidden = true; // 他のパネルを非表示
      panel.classList.remove(SHOW_CLASS);
    }
  });
};

// 親タブの切り替え時に子タブのアクティブ状態をリセットする
const resetChildTabs = (tabSet) => {
  const childTabSets = tabSet.querySelectorAll(TABSET_SEL); // 子タブセットを取得
  childTabSets.forEach((childTabSet) => {
    const defaultTab =
      childTabSet.querySelector(`${TAB_SEL}[aria-selected="true"]`) ||
      childTabSet.querySelector(TAB_SEL); // デフォルトの子タブを取得
    if (defaultTab) activateTab(defaultTab); // 子タブをアクティブ化
  });
};

// タブのクリック時の処理
const handleTabClick = (e) => {
  const newTab = e.currentTarget;
  activateTab(newTab); // クリックされたタブをアクティブ化

  // 親タブを切り替えた際に子タブの状態をリセット
  const tabSet = newTab.closest(TABSET_SEL);
  resetChildTabs(tabSet);
};

// キーボード操作時の処理
const handleTabKeydown = (e) => {
  const key = e.key;
  const currentTab = e.currentTarget;
  const tabSet = currentTab.closest(TABSET_SEL); // 現在のタブセットを取得
  const tabs = Array.from(tabSet.querySelectorAll(TAB_SEL));
  let newIndex;

  if (key === "ArrowRight") {
    newIndex = (tabs.indexOf(currentTab) + 1) % tabs.length; // 右矢印で次のタブへ
  } else if (key === "ArrowLeft") {
    newIndex = (tabs.indexOf(currentTab) - 1 + tabs.length) % tabs.length; // 左矢印で前のタブへ
  } else if (key === "Enter" || key === " ") {
    activateTab(currentTab); // Enterまたはスペースでアクティブ化
  }

  if (newIndex !== undefined) {
    e.preventDefault(); // デフォルトのフォーカス移動をキャンセル
    tabs[newIndex].focus(); // 次のタブにフォーカスを移動
    activateTab(tabs[newIndex]); // 次のタブをアクティブ化

    // 子タブセットの最初のタブをアクティブ化
    const tabPanels = tabSet.querySelectorAll(TABPANEL_SEL);
    const activePanel = tabPanels[newIndex];
    if (activePanel) {
      const childTabSet = activePanel.querySelector(TABSET_SEL);
      if (childTabSet) {
        const firstChildTab = childTabSet.querySelector(TAB_SEL);
        if (firstChildTab) {
          activateTab(firstChildTab); // 子タブの最初をアクティブ化
        }
      }
    }
  }
};

// すべてのタブにイベントリスナーを追加
tabTriggers.forEach((tab) => {
  tab.addEventListener("click", handleTabClick); // クリックイベント
  tab.addEventListener("keydown", handleTabKeydown); // キーボード操作イベント
});
