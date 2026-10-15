# Warm Editorial — design and interaction notes

本轮以一本持续编辑的个人笔记为方向：纸色背景、墨色正文、陶土色强调与鼠尾草色辅助；通过字体、细线和空间节奏建立层级，不依赖大面积卡片、渐变或商业宣传式组件。

## 设计系统

- 背景 Paper `#F6F3EC`；正文 Ink `#292B29`；分隔线 `#DCD6CB`。
- 陶土色艺术线条 `#B56E52`，正文链接使用更深的 `#995239`，保证在纸色背景上的文字对比度。
- 鼠尾草色艺术线条 `#72877B`，小字号文字使用 `#536C5D`。
- 深色背景采用暖绿墨色 `#222623`，文字为浅纸色，强调色相应提高亮度。
- 标题与随笔正文使用 Source Serif 4；导航、简介和辅助标注使用 DM Sans。三份 Latin WOFF2 字体均自托管，保留 SIL Open Font License。
- 桌面内容宽度上限 1200px；手机采用紧凑的双行导航，直接显示三个入口与主题按钮。

## About

大字号姓名、斜体身份、副文本与真实照片形成编辑式双栏。照片使用 `haoran-xu-original.jpg`，与桌面源文件保持一致；通过 `object-fit` 和 `object-position` 裁剪。保留自然的人像，不生成、不重绘、不改变五官。

下方将 Research 与 Reflections 做成阅读入口，构成从个人介绍到研究问题、再到个人思考的节奏。GitHub 使用用户确认的链接；没有填写邮箱时不输出假链接。

## Research

同一组 32 条曲线在两种形态间连续插值：Understanding 是开放的层叠线流，Designing 是新的闭合组织。图形是生成艺术隐喻，不是实验数据或机器学习教学 Demo。

- 点击方向按钮，同时切换文字、状态说明和曲线形态。
- 键盘支持左右箭头、Home、End；标签使用标准 tab / tabpanel 语义。
- `#understanding` 与 `#designing` 可直接链接到对应方向。
- 指针只造成很小的线条偏移，不阻止手机纵向滚动。
- 画面完成转换后停止动画循环；页面在后台时暂停。
- reduced-motion 下立即完成形态转换，不做指针变形或渐入。
- Designing 明确写成探索愿景，没有声称论文、实验或已完成成果。

## Reflections

正式文章通过可扩展的 collection 生成目录，并进入独立长文阅读页。正文使用较窄的衬线阅读栏；英文与中文一键切换，尽量保留对应段落的位置。顶部阅读进度仍是一条细线。

早期三篇排版草稿现已隐藏。当前 Reflections 展示作者正式提供的双语文章 **关于生活的一些想法 / On Living**。阅读布局与正文保真要求见 [双语文章说明](REFLECTIONS.md)。

关闭 JavaScript 时，双语正文仍完整可见，两个研究方向也保持可见。开启 reduced-motion 时，页面进入、滚动渐入、主题与展开动效均停用。

## 文件与维护

三个主页面使用 `_layouts/editorial.liquid`，样式集中在 `assets/css/editorial.css`，交互集中在 `assets/js/editorial.js`。没有引入客户端框架或 GSAP 依赖，Jekyll 构建和已有 GitHub Pages 工作流继续可用。

旧 Publications、CV 与 Projects 文件保留，暂从 `_config.yml` 的构建输出中排除。旧 al-folio 本地覆盖也保留为历史表现层，不参与三个主页面。

## 预览和检查

本地页面：

- <http://localhost:4000/>
- <http://localhost:4000/research/>
- <http://localhost:4000/reflections/>

重新启动：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/preview.ps1
```

验证：

```powershell
node scripts/check_editorial.cjs
python scripts/check_site.py _site
```

完整截图与检查结果在 `preview/editorial/`。这些本地审阅文件不会出现在网站构建或 Git 中。没有执行公开发布或仓库推送。
