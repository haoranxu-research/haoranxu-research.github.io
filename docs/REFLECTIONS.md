# Reflections：双语文章与长文阅读

目前仅展示一篇作者正式提供的文章：**关于生活的一些想法 / On Living**。旧的三篇 AI 排版样稿不再出现在构建后的网站中。

## 内容结构

文章目录来自 Jekyll 的 `reflections` collection，不需要在首页手写文章列表。

| 文件                                    | 用途                                       |
| --------------------------------------- | ------------------------------------------ |
| `_reflections/on-living.md`             | 文章元数据、标题、两种语言的来源路径和 URL |
| `_includes/reflections/on-living.en.md` | 英文译文，保留原始文件字节                 |
| `_includes/reflections/on-living.zh.md` | 中文原稿，保留原始文件字节                 |
| `_pages/reflections.md`                 | 自动生成的文章目录                         |
| `_layouts/reflection.liquid`            | 双语阅读页模板                             |
| `assets/css/reader.css`                 | 仅在 Reflections 加载的阅读样式            |
| `assets/js/reader.js`                   | 语言、标题、辅助技术状态与段落位置切换     |

源 Markdown 文件被加入 `.prettierignore`，防止排版工具重排作者的段落。页面将源文件的一级标题放入统一的阅读页页眉，正文按原始段落渲染。英文直撇号在渲染阶段转为等价 HTML 实体，防止 Kramdown 自动改成弯撇号；文件内容本身不变。

未添加发表日期、作者经历或额外的总结。本文已是正式内容，不使用“AI 草稿”或“等待作者确认”的标记。

## 阅读与语言

- 默认英文；固定在页眉下方的 English / 中文按钮可一键切换。
- 中文链接为 `/reflections/on-living/?lang=zh`。刷新该链接仍为中文；普通文章链接默认英文。
- 切换时保存当前段落与段落内的相对位置，定位到对应的译文段落。英文的额外文学译句与中文原句共用一个逻辑段落锚点。
- 正文设置 `lang="en"` 和 `lang="zh-Hans"`；标题、副标题及语言状态消息也设置对应语言。
- 中文使用自托管 Noto Serif SC，并保留思源宋体、系统宋体等后备。字体从公开的标准字体文件下载，再在本地裁剪字形；没有把文章文字发给字体服务。
- 桌面阅读宽度上限 720px；英文 20px / 1.9 行高，中文 19px / 2.1 行高；手机分别为 18px / 1.95 和 17.5px / 2.05。
- “乘兴而去，兴尽而归。”在英文正文中保留中文，并紧接提供的英文文学译句。只做克制的字号与细线强调。
- 正文不做进入或滚动隐藏动画。切换语言不引入额外动效，兼容 reduced-motion。
- 关闭 JavaScript 时，两种语言仍完整呈现，并提供页内跳转链接。

## 增加下一篇文章

1. 将两种语言的最终 Markdown 放进 `_includes/reflections/`，保持第一行标题与元数据中的语言标题一致。
2. 新建 `_reflections/<slug>.md`，使用 `layout: reflection`、`editorial_section: reflections`，填写 `title`、`title_en`、`title_zh`、`source_en`、`source_zh`、`order` 与 `permalink`。
3. 可填写 `excerpt_en` 作为目录摘句。它可以取自正文，不需要编造摘要或日期。
4. 中文字体的当前子集覆盖本篇文章；新文章缺少的字形会使用系统后备。需要完全统一字体时，可在本地扩充字体子集。
5. 中英文尽量按对应段落组织。若未来翻译拆分方式显著不同，需要为那篇文章增加明确的段落对应表。

## 本地检查

```powershell
node scripts/check_reflections.cjs
node scripts/check_editorial.cjs
python scripts/check_site.py _site
```

专用检查逐段比较生成页面和原始 Markdown，保留全部 40 个英文段落、39 个中文段落，包括原句和译句。还检查目录入口、键盘切换、正文中途位置、中文直接链接、主题、移动端溢出及静态回退。

截图与结果在 `preview/on-living/`。文章包本身被排除构建和 Git，不会复制到站点输出。没有执行部署或推送。
