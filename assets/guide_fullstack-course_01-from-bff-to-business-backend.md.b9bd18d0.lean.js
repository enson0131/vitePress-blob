import{d as L,h as I,j as E,o as h,c as v,l as _,H as m}from"./chunks/framework.ac6a668e.js";const B=`<div class="fullstack-source-block" data-source-block="0">
<p>针对你的背景，我建议把这套系列定位为：</p>
</div>
<div class="fullstack-source-block" data-source-block="1">
<blockquote>
<p><strong>有 Node BFF 和 Java Spring Boot 经验的前端，逐步成为能独立交付、维护一个业务系统的全栈开发者。</strong></p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="2">
<p>你已经有前端和服务端接口开发经验，接下来最值得投入的是：<strong>业务建模、数据库、事务与并发、资源权限、测试，以及部署和故障处理。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="3">
<p>我为你设计了 <strong>24 篇课程</strong>，用同一个项目贯穿学习。下面先给出完整路线，再直接开始<strong>第 01 篇正文</strong>。</p>
</div>
<div class="fullstack-source-block" data-source-block="4">
<p>完整教程也整理成了一份可打开阅读的文件，包含正文、场景练习和 <strong>6 道支持评分、答案解析的自测题</strong>：</p>
</div>
<div class="fullstack-source-block" data-source-block="5">
<p><a href="/vitePress-blob/fullstack-course/fullstack-series-01.html" download>fullstack-series-01.html</a></p>
</div>
<div class="fullstack-source-block" data-source-block="6">
<hr>
</div>
<div class="fullstack-source-block" data-source-block="7">
<h1 id="fullstack-heading-01">一、适合你的学习路线</h1>
</div>
<div class="fullstack-source-block" data-source-block="8">
<h2 id="fullstack-heading-02">1. 技术主线怎么选？</h2>
</div>
<div class="fullstack-source-block" data-source-block="9">
<p><strong>React / TypeScript → Spring Boot 模块化单体 → PostgreSQL。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="10">
<p>选择这条路线，是为了沿用你已有的 Spring Boot 背景，把主要精力花在业务设计、数据库和工程交付上。</p>
</div>
<div class="fullstack-source-block" data-source-block="11">
<p>这里的“模块化单体”，可以先理解为：<strong>代码按成员、项目、工单等业务划分模块，整体作为一个后端应用运行。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="12">
<p>Node 同样可以承担核心后端。本系列会在后半程引入 Node BFF，并安排与 Java 实现的对照，帮助你掌握能够跨语言迁移的能力。</p>
</div>
<div class="fullstack-source-block" data-source-block="13">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>位置</th>
<th>本系列选择</th>
<th>学习重点</th>
</tr>
</thead>
<tbody>
<tr>
<td>前端</td>
<td>React + TypeScript，沿用熟悉的构建方式</td>
<td>服务端状态、错误恢复、权限交互、并发冲突提示</td>
</tr>
<tr>
<td>核心后端</td>
<td>Java 21 + Spring Boot 4.1.x</td>
<td>用例组织、授权、事务、业务规则、可测试性</td>
</tr>
<tr>
<td>数据库</td>
<td>PostgreSQL 18</td>
<td>SQL、关系建模、约束、索引、事务与迁移</td>
</tr>
<tr>
<td>BFF / 工具服务</td>
<td>Node.js 24 LTS；需要结构化框架时使用 NestJS</td>
<td>页面聚合、会话适配、超时与失败处理</td>
</tr>
<tr>
<td>运行环境</td>
<td>Docker Compose + 反向代理 + CI/CD</td>
<td>配置、发布、日志、备份、恢复</td>
</tr>
<tr>
<td>后续组件</td>
<td>Redis、后台任务、对象存储</td>
<td>在具体需求出现时学习缓存和异步处理</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="14">
<p>本次核对的 Spring Boot 官方文档列出 4.1.1，支持 Java 21；Node 官方发布表将 24 标为 LTS。这里先确定教学基线，实际工程会锁定具体依赖版本。<sup class="citation"><a href="https://docs.spring.io/spring-boot/system-requirements.html" title="Spring Boot 系统要求" target="_blank" rel="noopener noreferrer">[1]</a></sup> <sup class="citation"><a href="https://nodejs.org/en/about/previous-releases" title="Node.js 发布与支持状态" target="_blank" rel="noopener noreferrer">[2]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="15">
<h3 id="fullstack-heading-03">BFF 什么时候加入？</h3>
</div>
<div class="fullstack-source-block" data-source-block="16">
<p>当一个页面需要聚合多个服务、管理浏览器会话，或者不同终端需要不同接口形态时，BFF 就有明确的用途。它可以承载面向使用体验的编排逻辑；新增一层也会增加网络跳转和运行维护成本。<sup class="citation"><a href="https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends" title="Microsoft BFF 架构模式" target="_blank" rel="noopener noreferrer">[3]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="17">
<p>因此，项目初期保持一个核心业务服务和一个数据库。后续通过实际需求判断是否增加组件，练习“为什么要加”的决策能力。</p>
</div>
<div class="fullstack-source-block" data-source-block="18">
<h2 id="fullstack-heading-04">2. 优先核查的六项能力</h2>
</div>
<div class="fullstack-source-block" data-source-block="19">
<p>你的现有背景已经覆盖了相当一部分开发工作。下面这些是本系列优先核查和补强的地方，<strong>并不预设你完全不会</strong>。</p>
</div>
<div class="fullstack-source-block" data-source-block="20">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>能力</th>
<th>自测问题</th>
<th>能力证据</th>
</tr>
</thead>
<tbody>
<tr>
<td>业务建模</td>
<td>需求只有一句话时，能否列清实体、关系、权限和状态规则？</td>
<td>数据模型、规则清单、接口契约</td>
</tr>
<tr>
<td>数据正确性</td>
<td>两个请求同时修改或创建时，结果是否仍符合规则？</td>
<td>唯一约束、事务、并发用例</td>
</tr>
<tr>
<td>资源授权</td>
<td>已登录用户修改 URL 中的 ID，能否访问别人的数据？</td>
<td>越权测试和租户隔离规则</td>
</tr>
<tr>
<td>故障处理</td>
<td>超时发生后，如何判断业务到底成功没有？</td>
<td>幂等策略、错误契约、追踪日志</td>
</tr>
<tr>
<td>性能分析</td>
<td>接口慢时，能否区分 SQL、网络、连接池和外部服务？</td>
<td>执行计划、指标和定位记录</td>
</tr>
<tr>
<td>运行交付</td>
<td>能否发布、升级数据库、恢复备份并定位生产问题？</td>
<td>部署说明、恢复演练和运行手册</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="21">
<p>例如，你如果已经熟悉统一登录，认证章节可以快速通过；但仍要检查：<strong>“登录以后，能操作哪个组织的哪个资源”是否也有完整保证。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="22">
<hr>
</div>
<div class="fullstack-source-block" data-source-block="23">
<h1 id="fullstack-heading-05">二、贯穿项目：TeamFlow 团队工单平台</h1>
</div>
<div class="fullstack-source-block" data-source-block="24">
<p>我们用一个接近管理平台日常工作的项目贯穿全系列：</p>
</div>
<div class="fullstack-source-block" data-source-block="25">
<blockquote>
<p><strong>一个用户可以加入多个团队；团队拥有项目；成员在项目中创建、指派、处理工单。</strong></p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="26">
<p>第一阶段只做项目列表、创建工单、工单查询和状态修改。之后逐步加入组织角色、租户隔离、并发控制、导入导出、通知、审计和运行监控。</p>
</div>
<div class="fullstack-source-block" data-source-block="27">
<p>这里的“租户”就是一个相互隔离的团队或公司。甲团队的用户不能因为知道乙团队的工单 ID，就看到或修改乙团队的数据。</p>
</div>
<div class="fullstack-source-block" data-source-block="28">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>阶段成果</th>
<th>你要能展示什么</th>
</tr>
</thead>
<tbody>
<tr>
<td>功能闭环</td>
<td>页面提交后写入真实数据库，刷新仍能查询</td>
</tr>
<tr>
<td>正确性闭环</td>
<td>非法状态、重复业务编号和并发修改都有明确结果</td>
</tr>
<tr>
<td>安全闭环</td>
<td>直接调用 API 也不能越权，列表、详情和文件权限一致</td>
</tr>
<tr>
<td>运行闭环</td>
<td>能发布、追踪故障、执行数据库升级并恢复备份</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="29">
<p>这也是后续整理全栈项目经历时的证据来源：<strong>说明自己解决了什么问题、怎么验证，而不只是列出使用过的框架。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="30">
<hr>
</div>
<div class="fullstack-source-block" data-source-block="31">
<h1 id="fullstack-heading-06">三、24 篇课程安排</h1>
</div>
<div class="fullstack-source-block" data-source-block="32">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>篇</th>
<th>主题</th>
<th>本篇交付成果</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>01</strong></td>
<td>从前端/BFF 走向完整业务交付</td>
<td>创建工单的职责、规则、失败路径与验收清单</td>
</tr>
<tr>
<td><strong>02</strong></td>
<td>跑通第一条真实业务链路</td>
<td>React → Spring Boot → PostgreSQL 的可运行功能</td>
</tr>
<tr>
<td><strong>03</strong></td>
<td>API 契约、校验与错误处理</td>
<td>稳定的请求、响应、状态码和错误结构</td>
</tr>
<tr>
<td><strong>04</strong></td>
<td>业务建模与关系建模</td>
<td>用户、团队、成员、项目、工单的数据模型</td>
</tr>
<tr>
<td><strong>05</strong></td>
<td>SQL、关联查询与数据库迁移</td>
<td>可重复建库、升级、初始化和查询</td>
</tr>
<tr>
<td><strong>06</strong></td>
<td>Spring Boot 的业务代码组织</td>
<td>按业务模块组织 Controller、Service、Repository</td>
</tr>
<tr>
<td><strong>07</strong></td>
<td>事务与业务一致性</td>
<td>工单和审计记录共同提交、共同回滚</td>
</tr>
<tr>
<td><strong>08</strong></td>
<td>并发、幂等与状态转换</td>
<td>两人同时编辑、超时重试和非法状态变更的处理</td>
</tr>
<tr>
<td><strong>09</strong></td>
<td>身份认证与登录态</td>
<td>接入身份系统，理解会话与令牌生命周期</td>
</tr>
<tr>
<td><strong>10</strong></td>
<td>授权、RBAC 与租户隔离</td>
<td>资源级权限判断和全链路租户作用域</td>
</tr>
<tr>
<td><strong>11</strong></td>
<td>Web 安全与输入边界</td>
<td>CSRF、XSS、注入、CORS 在项目中的处理</td>
</tr>
<tr>
<td><strong>12</strong></td>
<td>稳定的前后端交互</td>
<td>加载、取消、重试、乐观更新和冲突恢复</td>
</tr>
<tr>
<td><strong>13</strong></td>
<td>有意义的自动化测试</td>
<td>真实数据库、权限拒绝、事务回滚和关键并发测试</td>
</tr>
<tr>
<td><strong>14</strong></td>
<td>SQL 性能、索引与分页</td>
<td>读执行计划、定位慢查询、选择合适分页方式</td>
</tr>
<tr>
<td><strong>15</strong></td>
<td>Redis 缓存与一致性</td>
<td>缓存一个适合的查询，定义失效与陈旧容忍度</td>
</tr>
<tr>
<td><strong>16</strong></td>
<td>异步任务、Outbox 与可靠重试</td>
<td>持久化任务、重试、失败状态和重复消费处理</td>
</tr>
<tr>
<td><strong>17</strong></td>
<td>文件上传与批量导入导出</td>
<td>上传权限、逐行校验、错误报告和受控下载</td>
</tr>
<tr>
<td><strong>18</strong></td>
<td>Node BFF 的合理应用</td>
<td>聚合工单概览；对照 Node 与 Java 的用例组织</td>
</tr>
<tr>
<td><strong>19</strong></td>
<td>日志、指标与链路追踪</td>
<td>从页面报错追到服务、SQL 或后台任务</td>
</tr>
<tr>
<td><strong>20</strong></td>
<td>容器、配置与应用生命周期</td>
<td>可复现启动、健康检查、配置分离和正常退出</td>
</tr>
<tr>
<td><strong>21</strong></td>
<td>反向代理、域名与 HTTPS</td>
<td>完整访问链路，以及 Cookie、代理和跨域排障</td>
</tr>
<tr>
<td><strong>22</strong></td>
<td>CI/CD 与数据库变更</td>
<td>构建、校验、发布和向前兼容的数据库升级</td>
</tr>
<tr>
<td><strong>23</strong></td>
<td>压测、备份恢复与故障处理</td>
<td>一次有目标的压测和一次真实恢复演练</td>
</tr>
<tr>
<td><strong>24</strong></td>
<td>项目验收与全栈能力展示</td>
<td>可运行项目、设计说明、运行手册和成果表达</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="33">
<p>第 13 篇集中讲测试方法；前面的关键功能从实现时就做必要验证。</p>
</div>
<div class="fullstack-source-block" data-source-block="34">
<p><strong>每一篇采用固定结构：</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="35">
<ol>
<li>概念与前端经验的对应。</li>
<li>贯穿项目中的工程案例。</li>
<li>代码、流程图或数据模型。</li>
<li>互动练习。</li>
<li>至少 3 道带答案解析的选择题。</li>
<li>课后实践和验收条件。</li>
</ol>
</div>
<div class="fullstack-source-block" data-source-block="36">
<p>建议按在职学习安排：<strong>每周读 1—2 篇，留出一次集中动手时间。</strong> 可以用 12—16 周跑完第一轮；这是排期建议，是否进入下一阶段以实际验收为准。</p>
</div>
<div class="fullstack-source-block" data-source-block="37">
<hr>
</div>
<div class="fullstack-source-block" data-source-block="38">
<h1 id="fullstack-heading-07">第 01 篇：从“把接口接通”到“对业务结果负责”</h1>
</div>
<div class="fullstack-source-block" data-source-block="39">
<p>**本篇目标：**看懂一次“创建工单”背后的完整职责，能够说明数据为什么正确、权限在哪里执行、失败后保留什么结果，以及如何验证。</p>
</div>
<div class="fullstack-source-block" data-source-block="40">
<p>本篇是设计与边界课。HTTP 和 SQL 用于说明具体契约；Java 代码是明确省略基础设施实现的结构示意。<strong>第 02 篇会把第一条业务链路做成可运行工程。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="41">
<h2 id="fullstack-heading-08">1. 先改变“做完了”的判断标准</h2>
</div>
<div class="fullstack-source-block" data-source-block="42">
<p>收到需求：</p>
</div>
<div class="fullstack-source-block" data-source-block="43">
<blockquote>
<p>给项目加一个创建工单功能。</p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="44">
<p>你很熟悉页面部分：表单、输入校验、提交状态、接口调用、成功提示、刷新列表。已有 BFF 经验，也会考虑接口聚合、登录态和错误处理。</p>
</div>
<div class="fullstack-source-block" data-source-block="45">
<p>全栈需要继续把问题问到底：</p>
</div>
<div class="fullstack-source-block" data-source-block="46">
<ol>
<li><strong>谁可以在这个项目里创建工单？</strong></li>
<li>用户把项目 ID 改成别的团队的，会怎样？</li>
<li>两个请求同时创建相同业务编号，会怎样？</li>
<li>工单写入成功，审计写入失败，保留哪个结果？</li>
<li>数据库提交成功，但响应在网络里丢了，客户端该怎样重试？</li>
<li>上线后用户说“点了没反应”，你靠什么定位？</li>
</ol>
</div>
<div class="fullstack-source-block" data-source-block="47">
<p><strong>你负责的范围，从一次调用扩展到这个业务承诺在正常、异常和并发情况下都成立。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="48">
<p>这并不要求你一次掌握所有运维和架构知识。学习时按一个小功能逐步补齐这些保证，更容易形成可以迁移到其他项目的能力。</p>
</div>
<div class="fullstack-source-block" data-source-block="49">
<h2 id="fullstack-heading-09">2. 先写业务规则，再写接口</h2>
</div>
<div class="fullstack-source-block" data-source-block="50">
<p>本课采用一套明确的教学规则：</p>
</div>
<div class="fullstack-source-block" data-source-block="51">
<ul>
<li>一个用户可以属于多个租户。</li>
<li>项目继承租户角色：<code>ADMIN</code>、<code>MEMBER</code> 可以创建工单，<code>VIEWER</code> 只读。</li>
<li>本课还没有“私有项目成员”这层权限；后续如果加入，必须扩展授权判断。</li>
<li>工单标题需要经过服务端规范化和非空校验；具体长度口径在 API 契约章统一。</li>
<li>每个工单属于一个项目，且工单与项目必须属于同一个租户。</li>
<li>为了练习业务唯一性，本课允许提交业务编号：长度为 1—32 个字符，首字符为大写字母或数字，其余字符允许大写字母、数字和连字符，例如 <code>BUG-101</code>；同一项目内不可重复。</li>
<li>创建工单必须同时写入一条审计记录。</li>
<li>通知是后续能力；当前创建用例不直接调用邮件服务。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="52">
<p>业务规则确定后，请求可以写成：</p>
</div>
<div class="fullstack-source-block" data-source-block="53">
<pre><code class="language-http">POST /api/tenants/{tenantId}/projects/{projectId}/tickets
Content-Type: application/json
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="54">
<pre><code class="language-json">{
  &quot;ticketKey&quot;: &quot;BUG-101&quot;,
  &quot;title&quot;: &quot;修复登录后的跳转问题&quot;
}
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="55">
<p>创建并提交成功后返回：</p>
</div>
<div class="fullstack-source-block" data-source-block="56">
<pre><code class="language-http">HTTP/1.1 201 Created
Location: /api/tenants/{tenantId}/projects/{projectId}/tickets/{id}
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="57">
<pre><code class="language-json">{
  &quot;id&quot;: &quot;服务端生成的工单 UUID&quot;,
  &quot;ticketKey&quot;: &quot;BUG-101&quot;,
  &quot;title&quot;: &quot;修复登录后的跳转问题&quot;,
  &quot;status&quot;: &quot;OPEN&quot;
}
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="58">
<p>这里有两个不同的标识：</p>
</div>
<div class="fullstack-source-block" data-source-block="59">
<ul>
<li><code>id</code> 是技术主键。</li>
<li><code>ticketKey</code> 是业务编号。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="60">
<p>二者唯一的目的不同，也都不能自动代表“一次请求”。</p>
</div>
<div class="fullstack-source-block" data-source-block="61">
<p>请求体不让客户端决定创建人。服务端从经过验证的身份上下文取得 <code>userId</code>。URL 中的 <code>tenantId</code>、<code>projectId</code> 表示用户想操作的目标，仍然需要服务端验证。</p>
</div>
<div class="fullstack-source-block" data-source-block="62">
<p><strong>认证回答“你是谁”，授权回答“你能对这个资源做什么”。</strong> 有效登录并不代表对所有租户和项目都有权限。OWASP 建议默认拒绝，并在每次请求中执行权限检查。<sup class="citation"><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" title="OWASP 授权检查" target="_blank" rel="noopener noreferrer">[4]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="63">
<h2 id="fullstack-heading-10">3. 把一条请求拆成明确职责</h2>
</div>
<div class="fullstack-source-block" data-source-block="64">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>位置</th>
<th>本例中的职责</th>
</tr>
</thead>
<tbody>
<tr>
<td>React 页面</td>
<td>收集输入、提供即时校验、展示请求状态和可理解的错误</td>
</tr>
<tr>
<td>认证组件</td>
<td>验证凭据，构造可信的当前用户身份</td>
</tr>
<tr>
<td>Controller</td>
<td>接收 HTTP 参数，执行请求格式校验，调用业务用例，映射响应</td>
</tr>
<tr>
<td>Service / 用例层</td>
<td>判断成员角色、核实项目归属、执行创建规则、组织事务</td>
</tr>
<tr>
<td>Repository</td>
<td>执行带租户作用域的查询与写入</td>
</tr>
<tr>
<td>PostgreSQL</td>
<td>保存数据，通过约束保障可表达的数据不变量</td>
</tr>
<tr>
<td>运行观测</td>
<td>记录请求关联信息、异常和耗时，支撑问题定位</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="65">
<p>例如，“标题不能为空”同时出现在前端和服务端是合理的：</p>
</div>
<div class="fullstack-source-block" data-source-block="66">
<ul>
<li>前端帮助用户及时修改。</li>
<li>服务端处理所有进入系统的请求。</li>
<li>数据库也可以对关键字段设置非空和格式约束。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="67">
<p>这些校验服务于不同的边界。浏览器中的代码由客户端控制，服务端不能依据“页面已经校验过”就跳过自己的检查。</p>
</div>
<div class="fullstack-source-block" data-source-block="68">
<h3 id="fullstack-heading-11">互动：改变场景，观察责任位置</h3>
</div>
<div class="fullstack-source-block" data-source-block="69">
<p>下面是请求流程模拟，不连接真实服务。切换不同场景，观察关键处理位置。</p>
</div>
<div class="fullstack-source-block" data-source-block="70">
<section id="fs-boundaries" aria-label="创建工单：责任边界模拟">
  <h3 id="fullstack-heading-12">创建工单：责任边界模拟</h3>
  <div class="viz-controls">
    <label class="form-label" for="fs-scenario">请求场景
      <select id="fs-scenario" class="form-select">
        <option value="normal">正常创建</option>
        <option value="invalid">绕过前端提交空标题</option>
        <option value="tenant">访问其他租户项目</option>
        <option value="duplicate">同业务编号并发创建</option>
        <option value="email">提交后邮件失败</option>
      </select>
    </label>
  </div>
  <ol class="fs-steps" aria-label="业务操作经过的四个环节">
    <li data-layer="frontend">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>前端</span><span class="text-small text-muted">输入与反馈</span></div>
      <span class="fs-result">已提交</span>
    </li>
    <li data-layer="service">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>业务服务</span><span class="text-small text-muted">身份、权限、规则</span></div>
      <span class="fs-result">校验通过</span>
    </li>
    <li data-layer="database" class="fs-focus">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>数据库</span><span class="text-small text-muted">约束与事务</span></div>
      <span class="fs-result">工单与审计已提交</span>
    </li>
    <li data-layer="notification">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>异步通知</span><span class="text-small text-muted">后续扩展能力</span></div>
      <span class="fs-result">本课尚未接入</span>
    </li>
  </ol>
  <div id="fs-detail" class="text-small" aria-live="polite">模拟结果：数据库提交后创建成立；通知属于后续工作。</div>
</section>
</div>
<div class="fullstack-source-block" data-source-block="71">
<p>如果以后加入 Node BFF，它可以做概览聚合、响应整形和会话适配。核心业务服务仍要有明确的数据所有权与授权保证，避免另一条调用路径绕过关键规则。</p>
</div>
<div class="fullstack-source-block" data-source-block="72">
<h2 id="fullstack-heading-13">4. 工程案例：一个创建用例怎样组织？</h2>
</div>
<div class="fullstack-source-block" data-source-block="73">
<p>下面是 Service 的结构示意。<code>Actor</code>、仓储接口、DTO 和异常类型都需要在工程中实现；仅复制这个方法不能构成完整应用。</p>
</div>
<div class="fullstack-source-block" data-source-block="74">
<pre><code class="language-java">@Transactional
public TicketView createTicket(
        Actor actor,
        UUID tenantId,
        UUID projectId,
        CreateTicketCommand command) {

    // actor 来自验证后的身份；目标租户仍需授权。
    accessPolicy.requireTicketCreation(
        actor.userId(), tenantId);

    // 查询本身带 tenantId，确保项目属于目标租户。
    projectRepository.findByTenantAndId(tenantId, projectId)
        .orElseThrow(ResourceNotFoundException::new);

    var ticket = Ticket.open(
        UUID.randomUUID(),
        tenantId,
        projectId,
        command.ticketKey(),
        command.title(),
        actor.userId()
    );

    ticketRepository.insert(ticket);
    auditRepository.recordCreated(ticket, actor.userId());

    return TicketView.from(ticket);
}
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="75">
<p>这段代码的价值在于能看见五个决定。</p>
</div>
<div class="fullstack-source-block" data-source-block="76">
<h3 id="fullstack-heading-14">① 当前用户与请求数据分开</h3>
</div>
<div class="fullstack-source-block" data-source-block="77">
<p><code>Actor</code> 不能由 JSON 反序列化后直接当成可信身份。</p>
</div>
<div class="fullstack-source-block" data-source-block="78">
<p>客户端可以提交“我想创建什么”，但不能通过修改请求体来决定“我是谁”。</p>
</div>
<div class="fullstack-source-block" data-source-block="79">
<h3 id="fullstack-heading-15">② 权限有明确策略</h3>
</div>
<div class="fullstack-source-block" data-source-block="80">
<p><code>requireTicketCreation</code> 检查当前有效租户成员关系和 <code>ADMIN / MEMBER</code> 角色。</p>
</div>
<div class="fullstack-source-block" data-source-block="81">
<p>这里采用的是前面约定的权限模型：项目继承租户角色。如果以后有私有项目，还要补充项目级权限。</p>
</div>
<div class="fullstack-source-block" data-source-block="82">
<h3 id="fullstack-heading-16">③ 查询带业务作用域</h3>
</div>
<div class="fullstack-source-block" data-source-block="83">
<p>查询条件同时包含租户与项目 ID。</p>
</div>
<div class="fullstack-source-block" data-source-block="84">
<p>也就是说，我们查询的是：</p>
</div>
<div class="fullstack-source-block" data-source-block="85">
<blockquote>
<p>这个租户里的这个项目。</p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="86">
<h3 id="fullstack-heading-17">④ 业务对象维护自身规则</h3>
</div>
<div class="fullstack-source-block" data-source-block="87">
<p><code>Ticket.open</code> 在本示例中负责：</p>
</div>
<div class="fullstack-source-block" data-source-block="88">
<ul>
<li>标题规范化。</li>
<li>编号格式检查。</li>
<li>初始状态设为 <code>OPEN</code>。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="89">
<p>这样创建规则有明确归属，其他调用入口也可以复用。</p>
</div>
<div class="fullstack-source-block" data-source-block="90">
<h3 id="fullstack-heading-18">⑤ 相关写入共同提交</h3>
</div>
<div class="fullstack-source-block" data-source-block="91">
<p>工单和审计使用同一数据库、同一事务管理器和同一事务。</p>
</div>
<div class="fullstack-source-block" data-source-block="92">
<p>但 <code>@Transactional</code> 生效有条件。在默认代理模式下，事务方法需要通过代理调用。同一个对象内自调用带注解的方法，不会因此新建该方法声明的事务；如果外层已有事务，内层仍可能在外层事务中执行。<sup class="citation"><a href="https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html" title="Spring 声明式事务代理" target="_blank" rel="noopener noreferrer">[5]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="93">
<p>默认回滚规则主要针对运行时异常和 <code>Error</code>；异常被吞掉或回滚规则被改变时，结果也会变化。<sup class="citation"><a href="https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html" title="Spring 事务回滚规则" target="_blank" rel="noopener noreferrer">[6]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="94">
<p>因此，本例假设：</p>
</div>
<div class="fullstack-source-block" data-source-block="95">
<ul>
<li>这是经 Spring 代理调用的 Service 方法。</li>
<li>仓储参与同一事务。</li>
<li>写入失败的异常没有被吞掉。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="96">
<p>实际工程要用“让审计写入失败”的测试验证回滚，不能只看到注解就认定正确。</p>
</div>
<div class="fullstack-source-block" data-source-block="97">
<p><strong>换成 NestJS，核心问题仍然一样：谁发起操作、是否有权限、哪些规则必须成立、哪些写入需要共同提交。</strong> 变化的是依赖注入、事务 API 和数据库访问方式。</p>
</div>
<div class="fullstack-source-block" data-source-block="98">
<h2 id="fullstack-heading-19">5. 数据库约束：把规则落到数据上</h2>
</div>
<div class="fullstack-source-block" data-source-block="99">
<p>为了聚焦本课，下面给出三张表的 DDL：项目、工单和审计。</p>
</div>
<div class="fullstack-source-block" data-source-block="100">
<p>完整的用户、租户和成员表会在数据建模章节加入；<strong>这三张表本身不实现登录和授权</strong>。</p>
</div>
<div class="fullstack-source-block" data-source-block="101">
<pre><code class="language-sql">CREATE TABLE project (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    name text NOT NULL,
    PRIMARY KEY (tenant_id, id)
);

CREATE TABLE ticket (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    ticket_key text NOT NULL,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN',
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (tenant_id, id),
    CONSTRAINT uq_ticket_key
        UNIQUE (tenant_id, project_id, ticket_key),
    CONSTRAINT fk_ticket_project
        FOREIGN KEY (tenant_id, project_id)
        REFERENCES project (tenant_id, id),
    CONSTRAINT ck_ticket_key
        CHECK (ticket_key ~ '^[A-Z0-9][A-Z0-9-]{0,31}$'),
    CONSTRAINT ck_ticket_title
        CHECK (length(btrim(title)) &gt; 0),
    CONSTRAINT ck_ticket_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE'))
);

CREATE TABLE ticket_audit (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    actor_user_id uuid NOT NULL,
    event_type text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id, ticket_id)
        REFERENCES ticket (tenant_id, id)
);
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="102">
<p>理解三个重点即可：</p>
</div>
<div class="fullstack-source-block" data-source-block="103">
<ul>
<li><code>UNIQUE</code> 限制业务编号重复。</li>
<li>复合外键限制同租户引用。</li>
<li><code>CHECK</code> 限制字段值。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="104">
<p>PostgreSQL 支持这些约束；它们让不符合约束的写入失败。<sup class="citation"><a href="https://www.postgresql.org/docs/current/ddl-constraints.html" title="PostgreSQL 数据约束" target="_blank" rel="noopener noreferrer">[7]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="105">
<p>这个模型还刻意保留了几个边界：</p>
</div>
<div class="fullstack-source-block" data-source-block="106">
<ol>
<li><strong>复合外键不会自动给 SELECT 添加租户过滤。</strong> 它保证工单引用同一租户内存在的项目。</li>
<li>状态 <code>CHECK</code> 只限制可存的值；例如 <code>DONE</code> 能否回到 <code>OPEN</code>，需要状态转换规则。</li>
<li><code>btrim</code> 的示例只去除首尾普通空格；完整的空白处理和长度口径要由 API 契约、服务端规范化和数据库设计共同确定。</li>
<li>创建人和操作者在这份局部模型中只是 UUID 字段；完整身份关系将在第 04 篇建立。</li>
</ol>
</div>
<div class="fullstack-source-block" data-source-block="107">
<h3 id="fullstack-heading-20">为什么“先查再插入”仍然会重复？</h3>
</div>
<div class="fullstack-source-block" data-source-block="108">
<p>假设应用这样处理：</p>
</div>
<div class="fullstack-source-block" data-source-block="109">
<blockquote>
<p>先查询 <code>BUG-101</code> 是否存在，不存在就插入。</p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="110">
<p>考虑下面的时序：</p>
</div>
<div class="fullstack-source-block" data-source-block="111">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>时刻</th>
<th>请求 A</th>
<th>请求 B</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>查询：不存在</td>
<td></td>
</tr>
<tr>
<td>2</td>
<td></td>
<td>查询：不存在</td>
</tr>
<tr>
<td>3</td>
<td>执行插入</td>
<td></td>
</tr>
<tr>
<td>4</td>
<td></td>
<td>执行插入</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="112">
<p>两个请求都通过了“先查”这一步。</p>
</div>
<div class="fullstack-source-block" data-source-block="113">
<p><strong>在本例中，最终保障编号唯一的是数据库唯一约束。</strong> 预查询可以改善错误提示，但不能替代约束。</p>
</div>
<div class="fullstack-source-block" data-source-block="114">
<p>加上普通事务也不等于把全部请求排成单线程。以 PostgreSQL 默认的 Read Committed 为例，普通 SELECT 读取语句开始时的已提交快照，不能据此断言之后没有竞争写入。<sup class="citation"><a href="https://www.postgresql.org/docs/current/transaction-iso.html" title="PostgreSQL 事务隔离" target="_blank" rel="noopener noreferrer">[8]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="115">
<p>发生编号唯一冲突时，工程应识别具体的 <code>uq_ticket_key</code> 约束，再映射为业务冲突；连接失败等数据库异常不能全部包装成“编号已存在”。</p>
</div>
<div class="fullstack-source-block" data-source-block="116">
<p>本课采用让异常穿出事务方法、完成回滚后再映射错误的处理方式，避免留在失败事务中继续查询。</p>
</div>
<div class="fullstack-source-block" data-source-block="117">
<h2 id="fullstack-heading-21">6. 业务唯一性和请求幂等，要分开设计</h2>
</div>
<div class="fullstack-source-block" data-source-block="118">
<p>这两个概念很容易在“重复提交”里混到一起。</p>
</div>
<div class="fullstack-source-block" data-source-block="119">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>问题</th>
<th>本质</th>
<th>本项目的例子</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>业务唯一性</strong></td>
<td>哪些数据在业务上不允许同时存在？</td>
<td>同一项目不能有两个 <code>BUG-101</code></td>
</tr>
<tr>
<td><strong>请求幂等</strong></td>
<td>同一次操作执行多次，怎样避免产生额外业务效果？</td>
<td>第一次创建已成功，但客户端超时后再次提交</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="120">
<p>假如每次 POST 都生成一个新 UUID，再给它分配不同业务编号，数据库中的主键和编号都没有冲突，却可能产生两张用户本意相同的工单。</p>
</div>
<div class="fullstack-source-block" data-source-block="121">
<p>后续会设计请求幂等键：</p>
</div>
<div class="fullstack-source-block" data-source-block="122">
<ol>
<li>客户端对同一次操作保留一个键。</li>
<li>服务端把键、调用者与租户作用域、请求内容指纹、执行状态和结果按约定持久化。</li>
<li>同一键重试，返回同一次操作的结果。</li>
<li>同一键搭配不同请求内容，应拒绝。</li>
</ol>
</div>
<div class="fullstack-source-block" data-source-block="123">
<p>本篇尚未实现这套机制。</p>
</div>
<div class="fullstack-source-block" data-source-block="124">
<p>当前相同业务编号的第二次创建返回冲突，是业务唯一性的结果，不能据此宣称接口已经完整支持请求幂等。</p>
</div>
<div class="fullstack-source-block" data-source-block="125">
<h2 id="fullstack-heading-22">7. 本地事务能覆盖到哪里？</h2>
</div>
<div class="fullstack-source-block" data-source-block="126">
<p>本例的业务承诺是：</p>
</div>
<div class="fullstack-source-block" data-source-block="127">
<blockquote>
<p><strong>工单记录和审计记录共同提交；其中任一写入失败且满足回滚条件，就共同回滚。</strong></p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="128">
<p>但数据库事务无法把外部邮件服务、任意 HTTP 请求一起变成本地原子操作。两种顺序都有问题：</p>
</div>
<div class="fullstack-source-block" data-source-block="129">
<ul>
<li>**先发邮件，再提交数据库：**邮件已经发出，但数据库可能提交失败。</li>
<li>**先提交数据库，再发邮件：**数据库已经成功，但进程可能在发送前退出。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="130">
<p>需要可靠通知时，可以在同一数据库事务中写入：</p>
</div>
<div class="fullstack-source-block" data-source-block="131">
<ul>
<li>工单。</li>
<li>审计。</li>
<li>一条待发送事件，即 <strong>Outbox</strong>。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="132">
<p>后台任务读取已提交事件、发送通知、失败后重试，同时处理重复投递。该模式解决业务写入与事件保存之间的双写问题。<sup class="citation"><a href="https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html" title="Transactional Outbox" target="_blank" rel="noopener noreferrer">[9]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="133">
<p>这里的“可靠”有明确范围：<strong>待发送意图不会仅存在于内存中。</strong> 实际送达仍取决于发送端、接收端和重试策略，不能简单承诺邮件绝不会重复或永远不会失败。</p>
</div>
<div class="fullstack-source-block" data-source-block="134">
<p>另外：</p>
</div>
<div class="fullstack-source-block" data-source-block="135">
<blockquote>
<p><strong>客户端超时只说明客户端没及时拿到结果，不能单独证明数据库没有提交。</strong></p>
</blockquote>
</div>
<div class="fullstack-source-block" data-source-block="136">
<p>这正是第 08 篇要加入结果查询和重试幂等的原因。</p>
</div>
<div class="fullstack-source-block" data-source-block="137">
<h2 id="fullstack-heading-23">8. 错误响应也是接口契约的一部分</h2>
</div>
<div class="fullstack-source-block" data-source-block="138">
<p>本系列先采用如下约定：</p>
</div>
<div class="fullstack-source-block" data-source-block="139">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>情况</th>
<th>响应约定</th>
</tr>
</thead>
<tbody>
<tr>
<td>成功创建并提交</td>
<td><code>201</code>，返回新资源和 <code>Location</code></td>
</tr>
<tr>
<td>参数格式或输入规则不满足</td>
<td><code>400</code>；本系列统一使用这一约定</td>
</tr>
<tr>
<td>凭据缺失、失效或无效</td>
<td><code>401</code>，由认证层提供适用的 <code>WWW-Authenticate</code></td>
</tr>
<tr>
<td>身份有效，但角色不允许创建</td>
<td><code>403</code></td>
</tr>
<tr>
<td>项目不存在，或按既定策略隐藏无权访问资源</td>
<td><code>404</code></td>
</tr>
<tr>
<td>业务编号冲突</td>
<td><code>409</code>，返回稳定的业务错误码</td>
</tr>
<tr>
<td>未预期的内部故障</td>
<td>合适的 <code>5xx</code>，客户端拿到可追踪标识</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="140">
<p><code>400</code> 与 <code>422</code> 可以采用不同的 API 约定；这里选择 <code>400</code> 并保持一致。RFC 9110 定义了这些 HTTP 状态的语义，也允许用 <code>404</code> 隐藏不愿披露的资源存在性。<sup class="citation"><a href="https://www.rfc-editor.org/rfc/rfc9110.html" title="RFC 9110 HTTP 语义" target="_blank" rel="noopener noreferrer">[10]</a></sup></p>
</div>
<div class="fullstack-source-block" data-source-block="141">
<p>编号冲突时，可以返回：</p>
</div>
<div class="fullstack-source-block" data-source-block="142">
<pre><code class="language-json">{
  &quot;code&quot;: &quot;TICKET_KEY_CONFLICT&quot;,
  &quot;message&quot;: &quot;当前项目内已存在这个工单编号&quot;,
  &quot;traceId&quot;: &quot;一次请求的追踪标识&quot;
}
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="143">
<p>这三个字段各有用途：</p>
</div>
<div class="fullstack-source-block" data-source-block="144">
<ul>
<li>前端根据稳定的 <code>code</code> 决定行为。</li>
<li><code>message</code> 提供用户能理解的说明，可以做多语言。</li>
<li><code>traceId</code> 用于关联日志。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="145">
<p>这样，前端就不需要依赖“错误提示必须包含某几个中文字符”来判断业务情况。</p>
</div>
<div class="fullstack-source-block" data-source-block="146">
<p>统一错误结构的同时，也应保留有意义的 HTTP 状态，让调用方可靠地区分登录问题、权限问题、输入问题、业务冲突和服务故障。</p>
</div>
<div class="fullstack-source-block" data-source-block="147">
<h2 id="fullstack-heading-24">9. 课后工程练习：定义“创建工单完成了”</h2>
</div>
<div class="fullstack-source-block" data-source-block="148">
<p>先不增加页面功能，给当前用例写一张验收清单。</p>
</div>
<div class="fullstack-source-block" data-source-block="149">
<div class="table-scroll">
<table>
<thead>
<tr>
<th>验证场景</th>
<th>预期结果</th>
</tr>
</thead>
<tbody>
<tr>
<td>MEMBER 在所属租户的项目中创建合法工单</td>
<td><code>201</code>；有一条工单和一条创建审计</td>
</tr>
<tr>
<td>VIEWER 直接调用创建 API</td>
<td><code>403</code>；工单和审计都不增加</td>
</tr>
<tr>
<td>修改 tenantId / projectId，访问其他租户资源</td>
<td>按既定 <code>403/404</code> 策略拒绝；不泄露数据、不产生写入</td>
</tr>
<tr>
<td>绕过前端提交空标题</td>
<td><code>400</code>；不产生写入</td>
</tr>
<tr>
<td>同一项目并发创建同一业务编号</td>
<td>至多一条工单成功提交；冲突得到可识别结果</td>
</tr>
<tr>
<td>模拟审计写入失败</td>
<td>工单写入回滚；没有“工单成功但缺审计”的结果</td>
</tr>
<tr>
<td>创建成功后刷新页面</td>
<td>能从数据库重新查到该工单</td>
</tr>
<tr>
<td>响应在提交后丢失</td>
<td>能说明结果不确定；第 08 篇完善查询与幂等重试</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="fullstack-source-block" data-source-block="150">
<h3 id="fullstack-heading-25">本次作业包含三个产物</h3>
</div>
<div class="fullstack-source-block" data-source-block="151">
<ol>
<li>写出创建工单的请求、成功响应、失败响应。</li>
<li>标出至少五条业务规则由前端、服务端和数据库中的哪些位置保障。</li>
<li>为上表前六种情况写出 <code>Given / When / Then</code> 验收描述。</li>
</ol>
</div>
<div class="fullstack-source-block" data-source-block="152">
<p>例如：</p>
</div>
<div class="fullstack-source-block" data-source-block="153">
<pre><code class="language-text">Given：用户在租户 A 中的角色是 VIEWER
When：直接向租户 A 的项目提交创建工单请求
Then：返回 403
And：ticket 与 ticket_audit 的记录数都不增加
</code></pre>
</div>
<div class="fullstack-source-block" data-source-block="154">
<p>可以使用 AI 辅助生成表结构、代码和用例，但审阅时要问具体问题：</p>
</div>
<div class="fullstack-source-block" data-source-block="155">
<ul>
<li>这段查询是否带租户条件？</li>
<li>两个请求并发时，约束在哪里？</li>
<li>第二次写入失败，第一次写入是否真的回滚？</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="156">
<p><strong>能解释这些结果，才说明这部分能力被自己掌握了。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="157">
<h2 id="fullstack-heading-26">10. 自测：6 道选择题</h2>
</div>
<div class="fullstack-source-block" data-source-block="158">
<p>每题 1 分，共 6 分。文件中的题目支持选择答案、评分和查看解析；这里也保留完整题目与答案，方便直接阅读。</p>
</div>
<form id="course-quiz" aria-label="第01篇自测">
<div class="fullstack-source-block" data-source-block="159">
<h3 id="fullstack-heading-27">第 1 题：已登录用户改了租户 ID，服务端应怎样处理？</h3>
</div>
<div class="fullstack-source-block" data-source-block="160">
<div class="quiz-options" role="group" aria-label="第 1 题选项">
<label class="quiz-option"><input type="radio" name="q1" value="A"><span>A. JWT 有效就执行。</span></label>
<label class="quiz-option"><input type="radio" name="q1" value="B"><span>B. 校验目标租户成员关系、资源归属和目标动作权限。</span></label>
<label class="quiz-option"><input type="radio" name="q1" value="C"><span>C. UUID 很难猜，可以省略检查。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="161">
<p><strong>答案：B。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="162">
<p>有效身份只说明请求者是谁，仍要判断目标资源与动作是否获准。</p>
</div>
<div id="feedback-1" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="fullstack-source-block" data-source-block="163">
<h3 id="fullstack-heading-28">第 2 题：两个请求都查到 BUG-101 不存在，谁最终保障编号唯一？</h3>
</div>
<div class="fullstack-source-block" data-source-block="164">
<div class="quiz-options" role="group" aria-label="第 2 题选项">
<label class="quiz-option"><input type="radio" name="q2" value="A"><span>A. 前端禁用按钮。</span></label>
<label class="quiz-option"><input type="radio" name="q2" value="B"><span>B. 查询之后立刻插入。</span></label>
<label class="quiz-option"><input type="radio" name="q2" value="C"><span>C. 数据库中的对应唯一约束。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="165">
<p><strong>答案：C。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="166">
<p>查询和写入之间存在竞争窗口，数据库约束才能约束同时到来的写入。</p>
</div>
<div id="feedback-2" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="fullstack-source-block" data-source-block="167">
<h3 id="fullstack-heading-29">第 3 题：同一有效事务里，审计写入抛出未吞掉的运行时异常，会怎样？</h3>
</div>
<div class="fullstack-source-block" data-source-block="168">
<div class="quiz-options" role="group" aria-label="第 3 题选项">
<label class="quiz-option"><input type="radio" name="q3" value="A"><span>A. 工单和审计写入共同回滚。</span></label>
<label class="quiz-option"><input type="radio" name="q3" value="B"><span>B. 工单保留、审计丢失。</span></label>
<label class="quiz-option"><input type="radio" name="q3" value="C"><span>C. 自动向用户发送补偿邮件。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="169">
<p><strong>答案：A。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="170">
<p>题设已经限定同一事务、事务生效和符合默认回滚规则的异常传播。</p>
</div>
<div id="feedback-3" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="fullstack-source-block" data-source-block="171">
<h3 id="fullstack-heading-30">第 4 题：复合外键 <code>(tenant_id, project_id)</code> 最直接保障什么？</h3>
</div>
<div class="fullstack-source-block" data-source-block="172">
<div class="quiz-options" role="group" aria-label="第 4 题选项">
<label class="quiz-option"><input type="radio" name="q4" value="A"><span>A. SELECT 自动按租户过滤。</span></label>
<label class="quiz-option"><input type="radio" name="q4" value="B"><span>B. 当前用户一定是管理员。</span></label>
<label class="quiz-option"><input type="radio" name="q4" value="C"><span>C. 工单引用同一租户中存在的项目。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="173">
<p><strong>答案：C。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="174">
<p>外键保障引用关系；读取范围和调用者授权仍然要单独实现。</p>
</div>
<div id="feedback-4" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="fullstack-source-block" data-source-block="175">
<h3 id="fullstack-heading-31">第 5 题：工单已提交，但通知发送失败，后续应怎样提高可靠性？</h3>
</div>
<div class="fullstack-source-block" data-source-block="176">
<div class="quiz-options" role="group" aria-label="第 5 题选项">
<label class="quiz-option"><input type="radio" name="q5" value="A"><span>A. 把浏览器超时设置得足够长。</span></label>
<label class="quiz-option"><input type="radio" name="q5" value="B"><span>B. 同事务保存 Outbox 事件，后台发送、重试并处理重复投递。</span></label>
<label class="quiz-option"><input type="radio" name="q5" value="C"><span>C. 认为数据库事务会撤销外部邮件。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="177">
<p><strong>答案：B。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="178">
<p>持久化发送意图后，进程重启仍有机会继续执行；通知重复问题也需要处理。</p>
</div>
<div id="feedback-5" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="fullstack-source-block" data-source-block="179">
<h3 id="fullstack-heading-32">第 6 题：每次重试都生成新 UUID 和新业务编号，为什么仍可能创建逻辑重复工单？</h3>
</div>
<div class="fullstack-source-block" data-source-block="180">
<div class="quiz-options" role="group" aria-label="第 6 题选项">
<label class="quiz-option"><input type="radio" name="q6" value="A"><span>A. 数据库不能使用 UUID。</span></label>
<label class="quiz-option"><input type="radio" name="q6" value="B"><span>B. 所有 POST 都必须禁止重试。</span></label>
<label class="quiz-option"><input type="radio" name="q6" value="C"><span>C. 唯一技术标识没有识别“这是同一次业务操作”。</span></label>
</div>
</div>
<div class="fullstack-source-block" data-source-block="181">
<p><strong>答案：C。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="182">
<p>技术标识唯一、业务编号唯一和请求幂等，是三个需要分别定义的保证。</p>
</div>
<div id="feedback-6" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>
<div class="quiz-actions"><button type="submit">提交并查看解析</button><output id="quiz-score" aria-live="polite">共 6 题，每题 1 分</output></div>
</form>
<div class="fullstack-source-block" data-source-block="183">
<hr>
</div>
<div class="fullstack-source-block" data-source-block="184">
<h2 id="fullstack-heading-33">如何判断可以进入下一篇？</h2>
</div>
<div class="fullstack-source-block" data-source-block="185">
<p>如果你能不看答案解释清楚以下四点，就可以开始搭工程：</p>
</div>
<div class="fullstack-source-block" data-source-block="186">
<ul>
<li>创建工单时，可信身份从哪里来，目标资源怎样授权。</li>
<li>为什么数据库需要约束，普通事务为什么不能替代全部并发控制。</li>
<li>工单、审计和通知分别处于什么事务边界。</li>
<li>超时、冲突、无权限和内部故障，各自应该怎样被识别。</li>
</ul>
</div>
<div class="fullstack-source-block" data-source-block="187">
<p><strong>下一篇是第 02 篇：《跑通第一条真实业务链路：React + Spring Boot + PostgreSQL》。</strong></p>
</div>
<div class="fullstack-source-block" data-source-block="188">
<p>它会给出项目结构、数据库启动方式、迁移脚本、创建与查询接口、React 页面、联调步骤和验收方法，让你实际完成：<strong>页面创建工单 → 后端校验 → 数据库保存 → 返回结果 → 刷新后仍能查询。</strong></p>
</div>
`,C=1,S={path:"docs/.vitepress/theme/components/fullstack01/source.md",sha256:"d40f721d32711ef58aa7f3e6d6b8bf6cff9710fdbfcc867401dfe482d1668e91"},q="Element textContent, HTML entities decoded, whitespace collapsed with /\\s+/gu, then trimmed; codeBlocks.text retains exact whitespace and trailing newline.",y=[{index:0,kind:"paragraph",text:"针对你的背景，我建议把这套系列定位为：",sha256:"da88f51e70bef4320183d32d85befa131d271b3c9d38d21091692b8a1dda3ca8"},{index:1,kind:"blockquote",text:"有 Node BFF 和 Java Spring Boot 经验的前端，逐步成为能独立交付、维护一个业务系统的全栈开发者。",sha256:"cb48b02d8d977d15a71b9a01f3e3ad9af6e19c87e27ac8dd33a7b92c4f86eee7"},{index:2,kind:"paragraph",text:"你已经有前端和服务端接口开发经验，接下来最值得投入的是：业务建模、数据库、事务与并发、资源权限、测试，以及部署和故障处理。",sha256:"4b4dea14634f740b29157608ac32a6661f7ff63721c84a8abf069171773b4063"},{index:3,kind:"paragraph",text:"我为你设计了 24 篇课程，用同一个项目贯穿学习。下面先给出完整路线，再直接开始第 01 篇正文。",sha256:"ae3a04967288dd4ffd03a51ed92e90a6a0e8caa7b34cd8fa29a8b0ea7f4cf417"},{index:4,kind:"paragraph",text:"完整教程也整理成了一份可打开阅读的文件，包含正文、场景练习和 6 道支持评分、答案解析的自测题：",sha256:"f54ed3eaf5c31fdaaeff819bdd9cbb8ddf4cc8e85d23a183a95df987248945f2"},{index:5,kind:"paragraph",text:"fullstack-series-01.html",sha256:"abc724a038dc23782c7804ee088e75311503042f61643f33a884436780ed4cf8"},{index:6,kind:"hr",text:"",sha256:"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},{index:7,kind:"heading",text:"一、适合你的学习路线",sha256:"e4f3789e07a55312ce104bfeb7ff8ac847ee06b132a1355ef3984f8b7fdd9e5c"},{index:8,kind:"heading",text:"1. 技术主线怎么选？",sha256:"950ea28c7bf53768a6642cd486494a06a8bfb6db84a0a1507e46fc47b87cea45"},{index:9,kind:"paragraph",text:"React / TypeScript → Spring Boot 模块化单体 → PostgreSQL。",sha256:"327a092356e17a907d72e95f6d1062e4a9c2f3045d1d6a89f1da9fb907ca652c"},{index:10,kind:"paragraph",text:"选择这条路线，是为了沿用你已有的 Spring Boot 背景，把主要精力花在业务设计、数据库和工程交付上。",sha256:"eac8f2c7fbec8102d177dcec4e0b3a1b3fa0752bf88923bd2aa569b74e62fcb4"},{index:11,kind:"paragraph",text:"这里的“模块化单体”，可以先理解为：代码按成员、项目、工单等业务划分模块，整体作为一个后端应用运行。",sha256:"497de966cb08578cd2127620427518ebd918e8a7510c750724712b0fd2f87b17"},{index:12,kind:"paragraph",text:"Node 同样可以承担核心后端。本系列会在后半程引入 Node BFF，并安排与 Java 实现的对照，帮助你掌握能够跨语言迁移的能力。",sha256:"0fd7dd5ed71c236e06d2c5e4e4cbfdebe43863617e9574f99e2e2ba262ab749f"},{index:13,kind:"table",text:"位置 本系列选择 学习重点 前端 React + TypeScript，沿用熟悉的构建方式 服务端状态、错误恢复、权限交互、并发冲突提示 核心后端 Java 21 + Spring Boot 4.1.x 用例组织、授权、事务、业务规则、可测试性 数据库 PostgreSQL 18 SQL、关系建模、约束、索引、事务与迁移 BFF / 工具服务 Node.js 24 LTS；需要结构化框架时使用 NestJS 页面聚合、会话适配、超时与失败处理 运行环境 Docker Compose + 反向代理 + CI/CD 配置、发布、日志、备份、恢复 后续组件 Redis、后台任务、对象存储 在具体需求出现时学习缓存和异步处理",sha256:"2e1d5529b92730ae36b44e3fc4c0181ee9dc19cad4af392561143981ba87c652"},{index:14,kind:"paragraph",text:"本次核对的 Spring Boot 官方文档列出 4.1.1，支持 Java 21；Node 官方发布表将 24 标为 LTS。这里先确定教学基线，实际工程会锁定具体依赖版本。[1] [2]",sha256:"10616cccee99aeef3a30add8eeb5a9fa0af89eab4c52e9f0629360d31617823b"},{index:15,kind:"heading",text:"BFF 什么时候加入？",sha256:"3474202146219c6e800aa6339caced60f29333e31c353680dd13e3b43d2a3755"},{index:16,kind:"paragraph",text:"当一个页面需要聚合多个服务、管理浏览器会话，或者不同终端需要不同接口形态时，BFF 就有明确的用途。它可以承载面向使用体验的编排逻辑；新增一层也会增加网络跳转和运行维护成本。[3]",sha256:"6467b58762d3ccea6089f601fb72935976781aa25c2f3d199d8e773f0cfc6714"},{index:17,kind:"paragraph",text:"因此，项目初期保持一个核心业务服务和一个数据库。后续通过实际需求判断是否增加组件，练习“为什么要加”的决策能力。",sha256:"443ee7e581ced5b159b17316c0c9b41c5dce7199f8586b07fc467ed3e50b3e9a"},{index:18,kind:"heading",text:"2. 优先核查的六项能力",sha256:"7598eca49c7964807731eabc9fbaaa1c492f99052d5b26291312923a5633ba20"},{index:19,kind:"paragraph",text:"你的现有背景已经覆盖了相当一部分开发工作。下面这些是本系列优先核查和补强的地方，并不预设你完全不会。",sha256:"63c8ecf73a33e1619c8e8d048a149774eee755d22536f2bf34b06d728ed1d8b3"},{index:20,kind:"table",text:"能力 自测问题 能力证据 业务建模 需求只有一句话时，能否列清实体、关系、权限和状态规则？ 数据模型、规则清单、接口契约 数据正确性 两个请求同时修改或创建时，结果是否仍符合规则？ 唯一约束、事务、并发用例 资源授权 已登录用户修改 URL 中的 ID，能否访问别人的数据？ 越权测试和租户隔离规则 故障处理 超时发生后，如何判断业务到底成功没有？ 幂等策略、错误契约、追踪日志 性能分析 接口慢时，能否区分 SQL、网络、连接池和外部服务？ 执行计划、指标和定位记录 运行交付 能否发布、升级数据库、恢复备份并定位生产问题？ 部署说明、恢复演练和运行手册",sha256:"4de51a06b6344b033717690b88739f6859a8fa3fdfa0b113985ac5bc3c9085d8"},{index:21,kind:"paragraph",text:"例如，你如果已经熟悉统一登录，认证章节可以快速通过；但仍要检查：“登录以后，能操作哪个组织的哪个资源”是否也有完整保证。",sha256:"ef40266f39e293593e58bf1653c60c6b920eb62f4df4bc119369f9128878b453"},{index:22,kind:"hr",text:"",sha256:"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},{index:23,kind:"heading",text:"二、贯穿项目：TeamFlow 团队工单平台",sha256:"b8b1617a23659fb97759f7d7e44393c6d3fa0b13e0b9e6f05fb61a77551a3a90"},{index:24,kind:"paragraph",text:"我们用一个接近管理平台日常工作的项目贯穿全系列：",sha256:"dd59e35ac9822edbb4f8fd00fa408583754d04d2a6e81ef7852963c8ecd8db9f"},{index:25,kind:"blockquote",text:"一个用户可以加入多个团队；团队拥有项目；成员在项目中创建、指派、处理工单。",sha256:"a3c81e0237d33d3569600b22fe0b64cb7879cd189318f8cec41c185ddc1c4a8e"},{index:26,kind:"paragraph",text:"第一阶段只做项目列表、创建工单、工单查询和状态修改。之后逐步加入组织角色、租户隔离、并发控制、导入导出、通知、审计和运行监控。",sha256:"64af9b36419914b73d464b08e77e69bf44886e0b56112ba54d68749e906a6e93"},{index:27,kind:"paragraph",text:"这里的“租户”就是一个相互隔离的团队或公司。甲团队的用户不能因为知道乙团队的工单 ID，就看到或修改乙团队的数据。",sha256:"8412697bf04a9e8e392bc61785e3d93e1b718ed8e9fcc736ab12802a4bb05a0c"},{index:28,kind:"table",text:"阶段成果 你要能展示什么 功能闭环 页面提交后写入真实数据库，刷新仍能查询 正确性闭环 非法状态、重复业务编号和并发修改都有明确结果 安全闭环 直接调用 API 也不能越权，列表、详情和文件权限一致 运行闭环 能发布、追踪故障、执行数据库升级并恢复备份",sha256:"293ace42eac3d346675f283a4535f464941f6fee3ca2d70ce81e1f7210ff40b1"},{index:29,kind:"paragraph",text:"这也是后续整理全栈项目经历时的证据来源：说明自己解决了什么问题、怎么验证，而不只是列出使用过的框架。",sha256:"96413cc15f90eabc1b62ddfc543f04e0eae650f202308759478551fd333ca2a0"},{index:30,kind:"hr",text:"",sha256:"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},{index:31,kind:"heading",text:"三、24 篇课程安排",sha256:"96a516848c76e28b750cc4e6a981844c033a5366fb803c903751d3d25022dc92"},{index:32,kind:"table",text:"篇 主题 本篇交付成果 01 从前端/BFF 走向完整业务交付 创建工单的职责、规则、失败路径与验收清单 02 跑通第一条真实业务链路 React → Spring Boot → PostgreSQL 的可运行功能 03 API 契约、校验与错误处理 稳定的请求、响应、状态码和错误结构 04 业务建模与关系建模 用户、团队、成员、项目、工单的数据模型 05 SQL、关联查询与数据库迁移 可重复建库、升级、初始化和查询 06 Spring Boot 的业务代码组织 按业务模块组织 Controller、Service、Repository 07 事务与业务一致性 工单和审计记录共同提交、共同回滚 08 并发、幂等与状态转换 两人同时编辑、超时重试和非法状态变更的处理 09 身份认证与登录态 接入身份系统，理解会话与令牌生命周期 10 授权、RBAC 与租户隔离 资源级权限判断和全链路租户作用域 11 Web 安全与输入边界 CSRF、XSS、注入、CORS 在项目中的处理 12 稳定的前后端交互 加载、取消、重试、乐观更新和冲突恢复 13 有意义的自动化测试 真实数据库、权限拒绝、事务回滚和关键并发测试 14 SQL 性能、索引与分页 读执行计划、定位慢查询、选择合适分页方式 15 Redis 缓存与一致性 缓存一个适合的查询，定义失效与陈旧容忍度 16 异步任务、Outbox 与可靠重试 持久化任务、重试、失败状态和重复消费处理 17 文件上传与批量导入导出 上传权限、逐行校验、错误报告和受控下载 18 Node BFF 的合理应用 聚合工单概览；对照 Node 与 Java 的用例组织 19 日志、指标与链路追踪 从页面报错追到服务、SQL 或后台任务 20 容器、配置与应用生命周期 可复现启动、健康检查、配置分离和正常退出 21 反向代理、域名与 HTTPS 完整访问链路，以及 Cookie、代理和跨域排障 22 CI/CD 与数据库变更 构建、校验、发布和向前兼容的数据库升级 23 压测、备份恢复与故障处理 一次有目标的压测和一次真实恢复演练 24 项目验收与全栈能力展示 可运行项目、设计说明、运行手册和成果表达",sha256:"f65cfe7e2df0125a6183b898b9ff2f9341f3abf2f1570eefdf0c1ca59950d83b"},{index:33,kind:"paragraph",text:"第 13 篇集中讲测试方法；前面的关键功能从实现时就做必要验证。",sha256:"b66863039a07eb708ac63cd68eea35c92776ade3aa1383b0e42ca48cd9ccefaf"},{index:34,kind:"paragraph",text:"每一篇采用固定结构：",sha256:"2ec274d0da7c9f5ec556381ab4bf401a6adb62a073a643fa3beef535ade70fb7"},{index:35,kind:"ordered_list",text:"概念与前端经验的对应。 贯穿项目中的工程案例。 代码、流程图或数据模型。 互动练习。 至少 3 道带答案解析的选择题。 课后实践和验收条件。",sha256:"68819f5a7d2f7a54996120a1311184a540301700592c2a9b072443c1b6ce8059"},{index:36,kind:"paragraph",text:"建议按在职学习安排：每周读 1—2 篇，留出一次集中动手时间。 可以用 12—16 周跑完第一轮；这是排期建议，是否进入下一阶段以实际验收为准。",sha256:"3c6e2d3f172ae183ad271b3dc1073c872c88866016b8e0bab6b821f9e7062d90"},{index:37,kind:"hr",text:"",sha256:"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},{index:38,kind:"heading",text:"第 01 篇：从“把接口接通”到“对业务结果负责”",sha256:"f71d1139395461a921fbc22a190bbea4cde1d51da1c91d22881acf063d71542b"},{index:39,kind:"paragraph",text:"**本篇目标：**看懂一次“创建工单”背后的完整职责，能够说明数据为什么正确、权限在哪里执行、失败后保留什么结果，以及如何验证。",sha256:"738e8da13123bfabf76691601c1297992be3ddd49fc6e65c63224eb40d1dea91"},{index:40,kind:"paragraph",text:"本篇是设计与边界课。HTTP 和 SQL 用于说明具体契约；Java 代码是明确省略基础设施实现的结构示意。第 02 篇会把第一条业务链路做成可运行工程。",sha256:"c3fbaa22b4194a1091e0f946f4a2aaa3c7144b5c5c328bfa998aebb573f086a2"},{index:41,kind:"heading",text:"1. 先改变“做完了”的判断标准",sha256:"9b2c34af01121a383b1425bb84cd3d18a152bd34e1f405628551fe1b1dca78a5"},{index:42,kind:"paragraph",text:"收到需求：",sha256:"63d50f0e9cfad2dea5c9b090d77af3c6b07eec655bba9610b9af3e388f7fbe1f"},{index:43,kind:"blockquote",text:"给项目加一个创建工单功能。",sha256:"d679ee2963ba5740f536dceb9898b7b5dc3236c651d8258441aeee075613a983"},{index:44,kind:"paragraph",text:"你很熟悉页面部分：表单、输入校验、提交状态、接口调用、成功提示、刷新列表。已有 BFF 经验，也会考虑接口聚合、登录态和错误处理。",sha256:"33ec81bda842aba0aba67f635a74b7763ec49ce79f76d5c7c06e30c0c4819239"},{index:45,kind:"paragraph",text:"全栈需要继续把问题问到底：",sha256:"ebbb95b9ba40ea9ed4fb817d770852edff5c74fe731d3efad0a39f532f8c59e8"},{index:46,kind:"ordered_list",text:"谁可以在这个项目里创建工单？ 用户把项目 ID 改成别的团队的，会怎样？ 两个请求同时创建相同业务编号，会怎样？ 工单写入成功，审计写入失败，保留哪个结果？ 数据库提交成功，但响应在网络里丢了，客户端该怎样重试？ 上线后用户说“点了没反应”，你靠什么定位？",sha256:"ca4edd1fe5512661be48f29976c4207b6cbac0f30d68acd5b676a5073f11db65"},{index:47,kind:"paragraph",text:"你负责的范围，从一次调用扩展到这个业务承诺在正常、异常和并发情况下都成立。",sha256:"e89308572469da384d31b854498d64481e71423cd99b38f5040b1d3af6fc8e46"},{index:48,kind:"paragraph",text:"这并不要求你一次掌握所有运维和架构知识。学习时按一个小功能逐步补齐这些保证，更容易形成可以迁移到其他项目的能力。",sha256:"287ad1a765182b7ec0536ccae35b19977b21cd7bafcdaa247813c386b2d8da24"},{index:49,kind:"heading",text:"2. 先写业务规则，再写接口",sha256:"1b97308279f773999990bc172c464b249cdf284588dd456ff32ba3fcb00a7622"},{index:50,kind:"paragraph",text:"本课采用一套明确的教学规则：",sha256:"523780f72c6b2873ecfb1f233794e6b5081f337fe790d271935e652a33ca47c8"},{index:51,kind:"bullet_list",text:"一个用户可以属于多个租户。 项目继承租户角色：ADMIN、MEMBER 可以创建工单，VIEWER 只读。 本课还没有“私有项目成员”这层权限；后续如果加入，必须扩展授权判断。 工单标题需要经过服务端规范化和非空校验；具体长度口径在 API 契约章统一。 每个工单属于一个项目，且工单与项目必须属于同一个租户。 为了练习业务唯一性，本课允许提交业务编号：长度为 1—32 个字符，首字符为大写字母或数字，其余字符允许大写字母、数字和连字符，例如 BUG-101；同一项目内不可重复。 创建工单必须同时写入一条审计记录。 通知是后续能力；当前创建用例不直接调用邮件服务。",sha256:"ddce5376ec4f5e79c0094c52cae2225c45f743dbe8ed0102abebbb4582ad596e"},{index:52,kind:"paragraph",text:"业务规则确定后，请求可以写成：",sha256:"a78c6a2c303fc5eb2e1f78dce5f7d5cd1c493e5b7b7eaf03e62392cb26df3d6b"},{index:53,kind:"fence",text:"POST /api/tenants/{tenantId}/projects/{projectId}/tickets Content-Type: application/json",sha256:"8c39fb08dc40ec73df2fd87e6d74ac5318eafcda8011c373c53ff8a4e3b13e98"},{index:54,kind:"fence",text:'{ "ticketKey": "BUG-101", "title": "修复登录后的跳转问题" }',sha256:"c33ab46626f5c5248487ba6257afe20730b198f452f847aceafa066e8ad981d5"},{index:55,kind:"paragraph",text:"创建并提交成功后返回：",sha256:"734a4d068ef7d3c1054254da3f8198bf941c50eb52f74faa9a871ddcc0d214d0"},{index:56,kind:"fence",text:"HTTP/1.1 201 Created Location: /api/tenants/{tenantId}/projects/{projectId}/tickets/{id}",sha256:"ae380e9d11a302da55544b7edd6eedb47ed6102226058178c5a6be116023337a"},{index:57,kind:"fence",text:'{ "id": "服务端生成的工单 UUID", "ticketKey": "BUG-101", "title": "修复登录后的跳转问题", "status": "OPEN" }',sha256:"de9a90f802ad8250028548c6e92aa8aed272e9658e70adc32d518f66ef0e36e4"},{index:58,kind:"paragraph",text:"这里有两个不同的标识：",sha256:"da87498c7779de24dfd574d0c033fb1216400acab257e34bc0021288cd8b33d9"},{index:59,kind:"bullet_list",text:"id 是技术主键。 ticketKey 是业务编号。",sha256:"8a244519dcc079e9dc8b10f1c18c7781959889871721fd23ea996020c4e7a3eb"},{index:60,kind:"paragraph",text:"二者唯一的目的不同，也都不能自动代表“一次请求”。",sha256:"d1a25065a3e6f3150c3b4f8f57549e3fcbe41da75efb7fbc91076d2ae7c02d04"},{index:61,kind:"paragraph",text:"请求体不让客户端决定创建人。服务端从经过验证的身份上下文取得 userId。URL 中的 tenantId、projectId 表示用户想操作的目标，仍然需要服务端验证。",sha256:"8623a7a1ecb64fc4fc545a5977cf0e5476611a66c35903ab8ef88e486d42c866"},{index:62,kind:"paragraph",text:"认证回答“你是谁”，授权回答“你能对这个资源做什么”。 有效登录并不代表对所有租户和项目都有权限。OWASP 建议默认拒绝，并在每次请求中执行权限检查。[4]",sha256:"0dd2408210a9257324221226d590906640e1c2c5b269b9bae293a7df61639803"},{index:63,kind:"heading",text:"3. 把一条请求拆成明确职责",sha256:"13f594aadf2c32aef1037129bab2ec23f9888e442bc5b095086c2d589f23f8ab"},{index:64,kind:"table",text:"位置 本例中的职责 React 页面 收集输入、提供即时校验、展示请求状态和可理解的错误 认证组件 验证凭据，构造可信的当前用户身份 Controller 接收 HTTP 参数，执行请求格式校验，调用业务用例，映射响应 Service / 用例层 判断成员角色、核实项目归属、执行创建规则、组织事务 Repository 执行带租户作用域的查询与写入 PostgreSQL 保存数据，通过约束保障可表达的数据不变量 运行观测 记录请求关联信息、异常和耗时，支撑问题定位",sha256:"0f3faf686828ab4ce014303ac0183a811c4851e02fb020c11f73723897ce6a4f"},{index:65,kind:"paragraph",text:"例如，“标题不能为空”同时出现在前端和服务端是合理的：",sha256:"5dac9f153b014fd86933885f30ea5af6269914a1ad9ca796b0e7c48b85a1c145"},{index:66,kind:"bullet_list",text:"前端帮助用户及时修改。 服务端处理所有进入系统的请求。 数据库也可以对关键字段设置非空和格式约束。",sha256:"17bb541d97c6b4a155f983088166a0570d7504bcfde9c78465593318ed4542c6"},{index:67,kind:"paragraph",text:"这些校验服务于不同的边界。浏览器中的代码由客户端控制，服务端不能依据“页面已经校验过”就跳过自己的检查。",sha256:"1d275495fbf0c174e4bbddd87520909656abc7cc74c8264b22ab78991e937f7c"},{index:68,kind:"heading",text:"互动：改变场景，观察责任位置",sha256:"a3bd1abe9b3a1058d025b50fe37652c3b8e84a8e510ba66521a9dfef8d4726c6"},{index:69,kind:"paragraph",text:"下面是请求流程模拟，不连接真实服务。切换不同场景，观察关键处理位置。",sha256:"86506f0ef39b4fbc270611f1023c301bd688a9fce3eb6734c3c768fa3e7ab27d"},{index:70,kind:"interactive",text:"创建工单：责任边界模拟 请求场景 正常创建 绕过前端提交空标题 访问其他租户项目 同业务编号并发创建 提交后邮件失败 前端输入与反馈 已提交 业务服务身份、权限、规则 校验通过 数据库约束与事务 工单与审计已提交 异步通知后续扩展能力 本课尚未接入 模拟结果：数据库提交后创建成立；通知属于后续工作。",sha256:"7274a3139347260bb0ac1e1c9ba6a8e8dae6591ea0933a7255e543a955417616"},{index:71,kind:"paragraph",text:"如果以后加入 Node BFF，它可以做概览聚合、响应整形和会话适配。核心业务服务仍要有明确的数据所有权与授权保证，避免另一条调用路径绕过关键规则。",sha256:"0699f4397ea2ce94786b8e270ed89f2588b126560a0119f7b07b5726848f5474"},{index:72,kind:"heading",text:"4. 工程案例：一个创建用例怎样组织？",sha256:"2f1a22f98de9bc0fee8d41520b54aff200a04cf610fa52ac1992bf6839205232"},{index:73,kind:"paragraph",text:"下面是 Service 的结构示意。Actor、仓储接口、DTO 和异常类型都需要在工程中实现；仅复制这个方法不能构成完整应用。",sha256:"43d3b272a7e16a2dc8b2e99b4c3c0f919c7401a390777732b71a4ffe7d90434c"},{index:74,kind:"fence",text:"@Transactional public TicketView createTicket( Actor actor, UUID tenantId, UUID projectId, CreateTicketCommand command) { // actor 来自验证后的身份；目标租户仍需授权。 accessPolicy.requireTicketCreation( actor.userId(), tenantId); // 查询本身带 tenantId，确保项目属于目标租户。 projectRepository.findByTenantAndId(tenantId, projectId) .orElseThrow(ResourceNotFoundException::new); var ticket = Ticket.open( UUID.randomUUID(), tenantId, projectId, command.ticketKey(), command.title(), actor.userId() ); ticketRepository.insert(ticket); auditRepository.recordCreated(ticket, actor.userId()); return TicketView.from(ticket); }",sha256:"3026f1240ca92aeca6ef4480641b2ef7c6c64c2834afe54490cdcfa7264189f4"},{index:75,kind:"paragraph",text:"这段代码的价值在于能看见五个决定。",sha256:"1b74c3e8bd70b8e2fe6fae7a0c13330639aa2ed5d513f257ca616bec8d551635"},{index:76,kind:"heading",text:"① 当前用户与请求数据分开",sha256:"3c435593a32f81a6b2c790da420064947f1fcb0c81b3d2724d99ecb903f69348"},{index:77,kind:"paragraph",text:"Actor 不能由 JSON 反序列化后直接当成可信身份。",sha256:"f00e4bc7f2c9fdfebbeff580a6d254129f58c92e66a5fa8d8413968533377eb7"},{index:78,kind:"paragraph",text:"客户端可以提交“我想创建什么”，但不能通过修改请求体来决定“我是谁”。",sha256:"da95f618351e6327f5eddf6dbf766e80c54e6a75c849c2f93a713feda1a71411"},{index:79,kind:"heading",text:"② 权限有明确策略",sha256:"1fcefb4c3278e0b64789ce6d85b9dd58b07ac9511db5d4d792c84b3f8d87ef6d"},{index:80,kind:"paragraph",text:"requireTicketCreation 检查当前有效租户成员关系和 ADMIN / MEMBER 角色。",sha256:"24a1830c2d2b7aeee78c88d07776d4546e3f4235a94bd1593162e9e29d96f49f"},{index:81,kind:"paragraph",text:"这里采用的是前面约定的权限模型：项目继承租户角色。如果以后有私有项目，还要补充项目级权限。",sha256:"4606e9d07590ca5b942f1036d6dd35a40fc8614a4c9537b66b3f05caf4475eee"},{index:82,kind:"heading",text:"③ 查询带业务作用域",sha256:"41364069d9b3e77b31bfaf121eb47df27f135daafc976bf7a7ae2a08176c39ed"},{index:83,kind:"paragraph",text:"查询条件同时包含租户与项目 ID。",sha256:"ea63ef467b2e3e240766e0ac1ee4ed121dce9cca99e8667edd9f0b93e0f0e248"},{index:84,kind:"paragraph",text:"也就是说，我们查询的是：",sha256:"9a67524b0ff0df30645bf19e97767015c06dd894da5cac120bd936b3e791543a"},{index:85,kind:"blockquote",text:"这个租户里的这个项目。",sha256:"fad61fa71262b3dc9ce8bac9c6496e7fb99f53a8b5ee7ed727af4ed04d5ed326"},{index:86,kind:"heading",text:"④ 业务对象维护自身规则",sha256:"a60c5a03f7e94ce3345ec2f8f202db309ae0b4a46b223b0149fe35634e2f47dd"},{index:87,kind:"paragraph",text:"Ticket.open 在本示例中负责：",sha256:"67a87e5e9dc62730900a9a2a58e17da1311f88b73b329dc75128df8f9cbeb1e2"},{index:88,kind:"bullet_list",text:"标题规范化。 编号格式检查。 初始状态设为 OPEN。",sha256:"b0214336ef335873c7d01ef913f3db33e1033bbd2264316552a0aa0a50ba8401"},{index:89,kind:"paragraph",text:"这样创建规则有明确归属，其他调用入口也可以复用。",sha256:"7251dd16c039f9a3a3e1d340220b68afaeb639c826872e306f317bd55674ed68"},{index:90,kind:"heading",text:"⑤ 相关写入共同提交",sha256:"88e0f5ab69fbf1c2be47342865e1b73f436aad38befd7b0c2d8d99b6e20e1c42"},{index:91,kind:"paragraph",text:"工单和审计使用同一数据库、同一事务管理器和同一事务。",sha256:"3f108906a09218820d6c6403e7e952ef73f055063063dace636bb35b55e6062c"},{index:92,kind:"paragraph",text:"但 @Transactional 生效有条件。在默认代理模式下，事务方法需要通过代理调用。同一个对象内自调用带注解的方法，不会因此新建该方法声明的事务；如果外层已有事务，内层仍可能在外层事务中执行。[5]",sha256:"a6b6dd6be77c59f6c807222ef04a0a5e06b59aa38c8948bee4d663dff0c863fd"},{index:93,kind:"paragraph",text:"默认回滚规则主要针对运行时异常和 Error；异常被吞掉或回滚规则被改变时，结果也会变化。[6]",sha256:"63e9b2b30d89560b2b86585c5aebef34d218168139bdad693824b9bea5e1964c"},{index:94,kind:"paragraph",text:"因此，本例假设：",sha256:"929e43ad6f7e3a3aa1d8d4185003acb4ca12900e85c2d91fd893234816eb1789"},{index:95,kind:"bullet_list",text:"这是经 Spring 代理调用的 Service 方法。 仓储参与同一事务。 写入失败的异常没有被吞掉。",sha256:"19209a4fd591b3b52776ec1df58b430f1fe2896daecfb9a846ee669363b803b8"},{index:96,kind:"paragraph",text:"实际工程要用“让审计写入失败”的测试验证回滚，不能只看到注解就认定正确。",sha256:"6151f99c600029ce3481d06b14f25ca113c53fc86d8747da366c1e593dc6adf6"},{index:97,kind:"paragraph",text:"换成 NestJS，核心问题仍然一样：谁发起操作、是否有权限、哪些规则必须成立、哪些写入需要共同提交。 变化的是依赖注入、事务 API 和数据库访问方式。",sha256:"827878c992f0d0469ca35939327244b96accc08f5af2b2574db25beb1c1bd2f4"},{index:98,kind:"heading",text:"5. 数据库约束：把规则落到数据上",sha256:"cb288bd1ae8708717642afde7f19ca303dc4f3607ec5a341a25a69594a0d6b9e"},{index:99,kind:"paragraph",text:"为了聚焦本课，下面给出三张表的 DDL：项目、工单和审计。",sha256:"0a1b270868f4b2179c1f933ef4517275d2ca104420264225910af76b6cfe32cb"},{index:100,kind:"paragraph",text:"完整的用户、租户和成员表会在数据建模章节加入；这三张表本身不实现登录和授权。",sha256:"f10262a6a8bd4b8dc0119a713de34b3ca582db186e68df9e97ce7f59f1e33a72"},{index:101,kind:"fence",text:"CREATE TABLE project ( tenant_id uuid NOT NULL, id uuid NOT NULL, name text NOT NULL, PRIMARY KEY (tenant_id, id) ); CREATE TABLE ticket ( tenant_id uuid NOT NULL, id uuid NOT NULL, project_id uuid NOT NULL, ticket_key text NOT NULL, title text NOT NULL, status text NOT NULL DEFAULT 'OPEN', created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tenant_id, id), CONSTRAINT uq_ticket_key UNIQUE (tenant_id, project_id, ticket_key), CONSTRAINT fk_ticket_project FOREIGN KEY (tenant_id, project_id) REFERENCES project (tenant_id, id), CONSTRAINT ck_ticket_key CHECK (ticket_key ~ '^[A-Z0-9][A-Z0-9-]{0,31}$'), CONSTRAINT ck_ticket_title CHECK (length(btrim(title)) > 0), CONSTRAINT ck_ticket_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')) ); CREATE TABLE ticket_audit ( tenant_id uuid NOT NULL, id uuid NOT NULL, ticket_id uuid NOT NULL, actor_user_id uuid NOT NULL, event_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tenant_id, id), FOREIGN KEY (tenant_id, ticket_id) REFERENCES ticket (tenant_id, id) );",sha256:"339f2488315dd6526c876c902e340d7fc5ec74cbade50596b8cad0b799cbf195"},{index:102,kind:"paragraph",text:"理解三个重点即可：",sha256:"c840470dff3809fb6520bb9228176a4b99dbb83fa59857145c769f84db47422b"},{index:103,kind:"bullet_list",text:"UNIQUE 限制业务编号重复。 复合外键限制同租户引用。 CHECK 限制字段值。",sha256:"2f7c3126977faa769475da7b83681980de4c6d6ac79323bebbbf83d5ae187e10"},{index:104,kind:"paragraph",text:"PostgreSQL 支持这些约束；它们让不符合约束的写入失败。[7]",sha256:"c7e3a2fbeec6b90f09efbace5cbb58f782a1bef0158b0aa6d910dfb9db59661d"},{index:105,kind:"paragraph",text:"这个模型还刻意保留了几个边界：",sha256:"0948dc3dd8ab7b1694ef4c3054b60feb4fe1e470c727483ab939bd0cf7c4dacd"},{index:106,kind:"ordered_list",text:"复合外键不会自动给 SELECT 添加租户过滤。 它保证工单引用同一租户内存在的项目。 状态 CHECK 只限制可存的值；例如 DONE 能否回到 OPEN，需要状态转换规则。 btrim 的示例只去除首尾普通空格；完整的空白处理和长度口径要由 API 契约、服务端规范化和数据库设计共同确定。 创建人和操作者在这份局部模型中只是 UUID 字段；完整身份关系将在第 04 篇建立。",sha256:"d2a27c6fccf7aae198d0ca7aed22e62b4335806fbac7405cff37a85f13ef21c6"},{index:107,kind:"heading",text:"为什么“先查再插入”仍然会重复？",sha256:"541994298c7163b540f241bf6cd3cccc19ce7d9af0256b71ac8f40a60837c108"},{index:108,kind:"paragraph",text:"假设应用这样处理：",sha256:"b711bf79e251f05360aa90ce56d921ac372effebab3cb7bbc86fa7c2a9bcc182"},{index:109,kind:"blockquote",text:"先查询 BUG-101 是否存在，不存在就插入。",sha256:"214ac6be98b50b6143c9a8af01f605cab005a16dc1d685a6e0a4b72ec40c424c"},{index:110,kind:"paragraph",text:"考虑下面的时序：",sha256:"a75ff28a13ac007c5c79b928f1da8a6b494ec53f9a686910f9feea6b9a1d8ea2"},{index:111,kind:"table",text:"时刻 请求 A 请求 B 1 查询：不存在 2 查询：不存在 3 执行插入 4 执行插入",sha256:"c8e758a50f03b85d8b65dc28d4b4c6064f76169e652a24dd0089f0be3563c243"},{index:112,kind:"paragraph",text:"两个请求都通过了“先查”这一步。",sha256:"bc7aa540efe17e047fa3ce1821caa1c353fc40e8b58afe934794c6151310877d"},{index:113,kind:"paragraph",text:"在本例中，最终保障编号唯一的是数据库唯一约束。 预查询可以改善错误提示，但不能替代约束。",sha256:"9b51d1408b54f2c8202f49e429f2a70e8f4e7022d4f63c2d303ea322c23e11d7"},{index:114,kind:"paragraph",text:"加上普通事务也不等于把全部请求排成单线程。以 PostgreSQL 默认的 Read Committed 为例，普通 SELECT 读取语句开始时的已提交快照，不能据此断言之后没有竞争写入。[8]",sha256:"f2b8e9f26587460121a300b57ab91d87799e9fe2ad7d04e34b118fe6ede6ed56"},{index:115,kind:"paragraph",text:"发生编号唯一冲突时，工程应识别具体的 uq_ticket_key 约束，再映射为业务冲突；连接失败等数据库异常不能全部包装成“编号已存在”。",sha256:"bbc14929770c174cf89cb2a294b1a92b1b61069f3234bb336d688130c9d98eea"},{index:116,kind:"paragraph",text:"本课采用让异常穿出事务方法、完成回滚后再映射错误的处理方式，避免留在失败事务中继续查询。",sha256:"8e2ceceae94c2e17eb91d7790c4a2dc4c3e07258175e0162bfdad77a24865f94"},{index:117,kind:"heading",text:"6. 业务唯一性和请求幂等，要分开设计",sha256:"0b0776d4206f685de0e64a632edc01c634fe933e8638a19ef219fc1195355979"},{index:118,kind:"paragraph",text:"这两个概念很容易在“重复提交”里混到一起。",sha256:"b936d85b2736c00ea6d80726636a9496e5a93a4d33e0243aa063b2bf1d3920d1"},{index:119,kind:"table",text:"问题 本质 本项目的例子 业务唯一性 哪些数据在业务上不允许同时存在？ 同一项目不能有两个 BUG-101 请求幂等 同一次操作执行多次，怎样避免产生额外业务效果？ 第一次创建已成功，但客户端超时后再次提交",sha256:"b856d3b592c7f663adfd8b15a6a88bc1a5c73a8c4426e85bc93c827e7e07d0c5"},{index:120,kind:"paragraph",text:"假如每次 POST 都生成一个新 UUID，再给它分配不同业务编号，数据库中的主键和编号都没有冲突，却可能产生两张用户本意相同的工单。",sha256:"03658e230e10767f985b21e0c41adb2ad8c2116c353aec03cb01e6b077d534fe"},{index:121,kind:"paragraph",text:"后续会设计请求幂等键：",sha256:"6a301bd0ce21574e87011edf627c9b4943e7714d02d5c5316f61c331243ca199"},{index:122,kind:"ordered_list",text:"客户端对同一次操作保留一个键。 服务端把键、调用者与租户作用域、请求内容指纹、执行状态和结果按约定持久化。 同一键重试，返回同一次操作的结果。 同一键搭配不同请求内容，应拒绝。",sha256:"17a76dec699b1a4cf9ff409e01b474442b74a83212243a8bc3052c19cf63a9df"},{index:123,kind:"paragraph",text:"本篇尚未实现这套机制。",sha256:"5237d8a79c0fcd2479a141ab17feda4ebc9b7f23cb98a4173af89b2d2c06d715"},{index:124,kind:"paragraph",text:"当前相同业务编号的第二次创建返回冲突，是业务唯一性的结果，不能据此宣称接口已经完整支持请求幂等。",sha256:"082a3ca0afd841fb423587c10a988061ef5afcd6d59125374b818f5f0d0cf394"},{index:125,kind:"heading",text:"7. 本地事务能覆盖到哪里？",sha256:"81dc3150f50467b5ebc03c271476ca8a22888e496de207515c654f5e583df4a7"},{index:126,kind:"paragraph",text:"本例的业务承诺是：",sha256:"74e63d9405ca9fb9d3304386ddf0c5842765cad076eb09318c54cf62cbe47651"},{index:127,kind:"blockquote",text:"工单记录和审计记录共同提交；其中任一写入失败且满足回滚条件，就共同回滚。",sha256:"f5cd8483e2e685f6a9c79c9276bd3417af94ffb6ec6cb1bbd324a29f00257018"},{index:128,kind:"paragraph",text:"但数据库事务无法把外部邮件服务、任意 HTTP 请求一起变成本地原子操作。两种顺序都有问题：",sha256:"10fac16f6283d1cf0956efdc09b680f465b070e15be7e06dc66a5c344ef07e2e"},{index:129,kind:"bullet_list",text:"**先发邮件，再提交数据库：**邮件已经发出，但数据库可能提交失败。 **先提交数据库，再发邮件：**数据库已经成功，但进程可能在发送前退出。",sha256:"8263c74dc2abd1c95fe2d41e64932c8b336bf8140f4811d1d5cfe1c03597bb2f"},{index:130,kind:"paragraph",text:"需要可靠通知时，可以在同一数据库事务中写入：",sha256:"1de0aa5be2accc3aeaa2210e62bb03acecc630fffd3ee7463d7f8372021d5057"},{index:131,kind:"bullet_list",text:"工单。 审计。 一条待发送事件，即 Outbox。",sha256:"722565cbe00037f26a64a3f9016b497a292fffe9e60f43487b55af2f3fe1c2ea"},{index:132,kind:"paragraph",text:"后台任务读取已提交事件、发送通知、失败后重试，同时处理重复投递。该模式解决业务写入与事件保存之间的双写问题。[9]",sha256:"42fdc56352a3be376090ae2970dc7d9d96cd9bbbc6284976df9df87452ea9038"},{index:133,kind:"paragraph",text:"这里的“可靠”有明确范围：待发送意图不会仅存在于内存中。 实际送达仍取决于发送端、接收端和重试策略，不能简单承诺邮件绝不会重复或永远不会失败。",sha256:"3855ab6d056bf395ead4d9487dc0b571eb01e7c3307c2cbf3a30b6d677d7fc4c"},{index:134,kind:"paragraph",text:"另外：",sha256:"11d2ea45be648f44bb4cbd8a196c88147495c9027641cb3e79606200dbc07cbb"},{index:135,kind:"blockquote",text:"客户端超时只说明客户端没及时拿到结果，不能单独证明数据库没有提交。",sha256:"d568724300b6ff03dee5746ec760d78954819d9a7b34d908d9e7eff6614108e1"},{index:136,kind:"paragraph",text:"这正是第 08 篇要加入结果查询和重试幂等的原因。",sha256:"acfa10b29dc04dfac2bd4fcf16afa180dd913933869b5e768eba6806d187ba48"},{index:137,kind:"heading",text:"8. 错误响应也是接口契约的一部分",sha256:"ea554cfb0a47aa93737eee0b0ec3bba49ec157c00a63a673b9c6edc3b581e938"},{index:138,kind:"paragraph",text:"本系列先采用如下约定：",sha256:"5bd63c37eef4de5342cec5620806ff9af712f4d2e8bddb14b49b7557c2578606"},{index:139,kind:"table",text:"情况 响应约定 成功创建并提交 201，返回新资源和 Location 参数格式或输入规则不满足 400；本系列统一使用这一约定 凭据缺失、失效或无效 401，由认证层提供适用的 WWW-Authenticate 身份有效，但角色不允许创建 403 项目不存在，或按既定策略隐藏无权访问资源 404 业务编号冲突 409，返回稳定的业务错误码 未预期的内部故障 合适的 5xx，客户端拿到可追踪标识",sha256:"4483486cd0e7a7348b921428ababe21e583ed0aa01917c588f73658aee97f515"},{index:140,kind:"paragraph",text:"400 与 422 可以采用不同的 API 约定；这里选择 400 并保持一致。RFC 9110 定义了这些 HTTP 状态的语义，也允许用 404 隐藏不愿披露的资源存在性。[10]",sha256:"34d49ff345a4c6c0aa47c083a8453673e93ead26881f08fb808216bc806eeb90"},{index:141,kind:"paragraph",text:"编号冲突时，可以返回：",sha256:"8f240e59b03365c6a7608ece9b807b207157fc455176ab6c213fd9b9e0804850"},{index:142,kind:"fence",text:'{ "code": "TICKET_KEY_CONFLICT", "message": "当前项目内已存在这个工单编号", "traceId": "一次请求的追踪标识" }',sha256:"24c5018dd08380939c39a89fa965a21e253320a07d4b18edf0d6565f60f99f85"},{index:143,kind:"paragraph",text:"这三个字段各有用途：",sha256:"03cd9cea09bdf6bc1fb98f0fe8bccfc2a163bd5d78e00920e44638c4a617cc15"},{index:144,kind:"bullet_list",text:"前端根据稳定的 code 决定行为。 message 提供用户能理解的说明，可以做多语言。 traceId 用于关联日志。",sha256:"7340edb4835ad412d404c586ee435a67d79163aabe58fb9636325954a9563743"},{index:145,kind:"paragraph",text:"这样，前端就不需要依赖“错误提示必须包含某几个中文字符”来判断业务情况。",sha256:"35a52228c8362d548fed4a8625afd2aa7bb8bd19410077d00aaf28fc032982c1"},{index:146,kind:"paragraph",text:"统一错误结构的同时，也应保留有意义的 HTTP 状态，让调用方可靠地区分登录问题、权限问题、输入问题、业务冲突和服务故障。",sha256:"24d07d6349061d30789299856c882532d2447457ff487580fddc50a981cb64c0"},{index:147,kind:"heading",text:"9. 课后工程练习：定义“创建工单完成了”",sha256:"2610bcb960ed9150e1d826e535323ad35b15c3de56e55c0b2de1a0c18eb66db5"},{index:148,kind:"paragraph",text:"先不增加页面功能，给当前用例写一张验收清单。",sha256:"55184b1e711ff8e4be1ee6d0cf2a707a13e785722b5b82406f379b9436606ce7"},{index:149,kind:"table",text:"验证场景 预期结果 MEMBER 在所属租户的项目中创建合法工单 201；有一条工单和一条创建审计 VIEWER 直接调用创建 API 403；工单和审计都不增加 修改 tenantId / projectId，访问其他租户资源 按既定 403/404 策略拒绝；不泄露数据、不产生写入 绕过前端提交空标题 400；不产生写入 同一项目并发创建同一业务编号 至多一条工单成功提交；冲突得到可识别结果 模拟审计写入失败 工单写入回滚；没有“工单成功但缺审计”的结果 创建成功后刷新页面 能从数据库重新查到该工单 响应在提交后丢失 能说明结果不确定；第 08 篇完善查询与幂等重试",sha256:"6ab5a0d72c038f7a9ecb9bf6b5a7b8a900c59787710e2b858b8a94262f4fa2af"},{index:150,kind:"heading",text:"本次作业包含三个产物",sha256:"047c803b33940852a55d6535353e23115e2db4d23854f7286c2a75e3efb066d5"},{index:151,kind:"ordered_list",text:"写出创建工单的请求、成功响应、失败响应。 标出至少五条业务规则由前端、服务端和数据库中的哪些位置保障。 为上表前六种情况写出 Given / When / Then 验收描述。",sha256:"94edd064c52b4654be030721eb68c6ff7c9e14001348d1a60d4a526211459683"},{index:152,kind:"paragraph",text:"例如：",sha256:"2eeeceff78bfedebe3eab620973524782c809387e7cba8b1760cee33ec874481"},{index:153,kind:"fence",text:"Given：用户在租户 A 中的角色是 VIEWER When：直接向租户 A 的项目提交创建工单请求 Then：返回 403 And：ticket 与 ticket_audit 的记录数都不增加",sha256:"ed00cb9b961114ba4cbb1c339dd76e420f84204743918628bc08b2827bd0399f"},{index:154,kind:"paragraph",text:"可以使用 AI 辅助生成表结构、代码和用例，但审阅时要问具体问题：",sha256:"a88892ce48e0e51f697185025cde100b15d12d75743e28274b11e863f0797a64"},{index:155,kind:"bullet_list",text:"这段查询是否带租户条件？ 两个请求并发时，约束在哪里？ 第二次写入失败，第一次写入是否真的回滚？",sha256:"caa67780f74a3f27deef1be6cdea36a782951cbc380bf295f755c51518cd08f2"},{index:156,kind:"paragraph",text:"能解释这些结果，才说明这部分能力被自己掌握了。",sha256:"41a1809f23d5b08494efa45054e9288266404000580f04b58944e350f0567735"},{index:157,kind:"heading",text:"10. 自测：6 道选择题",sha256:"bbad45ea1d9e00cb3860a39bc2782a917c2795b428d764ca189fdf137b7a8cf3"},{index:158,kind:"paragraph",text:"每题 1 分，共 6 分。文件中的题目支持选择答案、评分和查看解析；这里也保留完整题目与答案，方便直接阅读。",sha256:"0a8166c38d83bea00186ec2c8890af6fccdcc6931803504f538c719fad17c745"},{index:159,kind:"heading",text:"第 1 题：已登录用户改了租户 ID，服务端应怎样处理？",sha256:"7b9f270f857f5c492c3cfb71aacc9953e2cc02c78f89f7ffb7ce84c6f0cfc7f0"},{index:160,kind:"paragraph",text:"A. JWT 有效就执行。 B. 校验目标租户成员关系、资源归属和目标动作权限。 C. UUID 很难猜，可以省略检查。",sha256:"baac14b4579d9575ce01fe8fb1c753dd44473ee8167a1f1af1f1c34571d0366b"},{index:161,kind:"paragraph",text:"答案：B。",sha256:"54b0f0ea4f3c140372234095d6bf0c74ed3700de6bd3263a79d76c7c723edec9"},{index:162,kind:"paragraph",text:"有效身份只说明请求者是谁，仍要判断目标资源与动作是否获准。",sha256:"0f8977928f1b4b19729364bb0c777b6d54b6d50f5543e3864a5d1499c0948bf9"},{index:163,kind:"heading",text:"第 2 题：两个请求都查到 BUG-101 不存在，谁最终保障编号唯一？",sha256:"1b5fed1e0e719943d90cbae430dc0f875b76971835c8fd925b665e268128c6af"},{index:164,kind:"paragraph",text:"A. 前端禁用按钮。 B. 查询之后立刻插入。 C. 数据库中的对应唯一约束。",sha256:"0f039b2d65a65a0bdccbee4df67f0566c3b487dedd82df557485868e07803fe0"},{index:165,kind:"paragraph",text:"答案：C。",sha256:"0178252811fb708794352c0a0ae05dd4c4121cbbda2988405aee64245f6bb355"},{index:166,kind:"paragraph",text:"查询和写入之间存在竞争窗口，数据库约束才能约束同时到来的写入。",sha256:"e06fc6b5d45c2c6d6714ce373bf28ab034a60247b455f5989e1c06796f38e1a2"},{index:167,kind:"heading",text:"第 3 题：同一有效事务里，审计写入抛出未吞掉的运行时异常，会怎样？",sha256:"6ac93d1b1be91042dd1f879b5511689960472a7b329bb4951889126efa29741c"},{index:168,kind:"paragraph",text:"A. 工单和审计写入共同回滚。 B. 工单保留、审计丢失。 C. 自动向用户发送补偿邮件。",sha256:"8c2990aa817498ce59d5ce2319ac29ee8d4c292d5ab57f183fb07d93a2c67940"},{index:169,kind:"paragraph",text:"答案：A。",sha256:"817ced6f08cbf876010a040d995d17ec269db506b5a9b22e57c142ca1f6b2c36"},{index:170,kind:"paragraph",text:"题设已经限定同一事务、事务生效和符合默认回滚规则的异常传播。",sha256:"bfceb6fed10ba41d3c204aa9856cfed42e2675462e5492be35c24d8f1d344569"},{index:171,kind:"heading",text:"第 4 题：复合外键 (tenant_id, project_id) 最直接保障什么？",sha256:"68ee6c08f5f2777d27abf0a791518c5ee1c26073c63fb9b06e26a1cb463da999"},{index:172,kind:"paragraph",text:"A. SELECT 自动按租户过滤。 B. 当前用户一定是管理员。 C. 工单引用同一租户中存在的项目。",sha256:"42e0ba8afe64909df2d769d976dd833ece1e9e33ca472b68e5045a98b6be5221"},{index:173,kind:"paragraph",text:"答案：C。",sha256:"0178252811fb708794352c0a0ae05dd4c4121cbbda2988405aee64245f6bb355"},{index:174,kind:"paragraph",text:"外键保障引用关系；读取范围和调用者授权仍然要单独实现。",sha256:"4e2fe5be5e1701b824e4960f22e01b66dca94a6506bf3db1ded4c156e7c6e703"},{index:175,kind:"heading",text:"第 5 题：工单已提交，但通知发送失败，后续应怎样提高可靠性？",sha256:"8d4580d5e960c7b7482ded28950169e63023cb308c7dcb0785821ed6174c05b7"},{index:176,kind:"paragraph",text:"A. 把浏览器超时设置得足够长。 B. 同事务保存 Outbox 事件，后台发送、重试并处理重复投递。 C. 认为数据库事务会撤销外部邮件。",sha256:"48cf2d891d0fb2159d499901fdd6e79445204a8d38c3b1fc57757692c0d1d89a"},{index:177,kind:"paragraph",text:"答案：B。",sha256:"54b0f0ea4f3c140372234095d6bf0c74ed3700de6bd3263a79d76c7c723edec9"},{index:178,kind:"paragraph",text:"持久化发送意图后，进程重启仍有机会继续执行；通知重复问题也需要处理。",sha256:"6fafd965b388b396646df0b2d3f4213d9cb3fc16d28a8e732d4411d7d3ce3759"},{index:179,kind:"heading",text:"第 6 题：每次重试都生成新 UUID 和新业务编号，为什么仍可能创建逻辑重复工单？",sha256:"537ff72d3989e8d80834e47489910f33371e9b32cbe2e3bd9d9ba55406ed2d11"},{index:180,kind:"paragraph",text:"A. 数据库不能使用 UUID。 B. 所有 POST 都必须禁止重试。 C. 唯一技术标识没有识别“这是同一次业务操作”。",sha256:"153bdaecf46a7496e9035a5a26b504c3cb577acf145e61c13125200641b9d59d"},{index:181,kind:"paragraph",text:"答案：C。",sha256:"0178252811fb708794352c0a0ae05dd4c4121cbbda2988405aee64245f6bb355"},{index:182,kind:"paragraph",text:"技术标识唯一、业务编号唯一和请求幂等，是三个需要分别定义的保证。",sha256:"07cfb40936d00993ff9171c84fba5989f0aaf8ef58943ce18a09e8591dc41361"},{index:183,kind:"hr",text:"",sha256:"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},{index:184,kind:"heading",text:"如何判断可以进入下一篇？",sha256:"a414cc98466a64bfd91804f8784b1d82d1f35b6afd24dc611ca1e0c2da9bd183"},{index:185,kind:"paragraph",text:"如果你能不看答案解释清楚以下四点，就可以开始搭工程：",sha256:"31e37d6dbc007d8853396aa93a8c22dfe6b04dbe131e6dd534473b67d6819f3e"},{index:186,kind:"bullet_list",text:"创建工单时，可信身份从哪里来，目标资源怎样授权。 为什么数据库需要约束，普通事务为什么不能替代全部并发控制。 工单、审计和通知分别处于什么事务边界。 超时、冲突、无权限和内部故障，各自应该怎样被识别。",sha256:"5a0ebdfe2f7111318a095090a93dc3a7fc6c2a3671494d2de5ce5aa810c5f487"},{index:187,kind:"paragraph",text:"下一篇是第 02 篇：《跑通第一条真实业务链路：React + Spring Boot + PostgreSQL》。",sha256:"84512995ef04a6151a45c630c7be36ec2170b351ec91574d768b7249d3c428af"},{index:188,kind:"paragraph",text:"它会给出项目结构、数据库启动方式、迁移脚本、创建与查询接口、React 页面、联调步骤和验收方法，让你实际完成：页面创建工单 → 后端校验 → 数据库保存 → 返回结果 → 刷新后仍能查询。",sha256:"9ba11b6e21eea0214500baca0e9d3d24beeae8899d5864b2c91b6d5f4b57c061"}],U=[{index:0,sourceBlock:53,language:"http",text:`POST /api/tenants/{tenantId}/projects/{projectId}/tickets
Content-Type: application/json
`,sha256:"b20a263a3a935a04db962922c0debac80bf7a902d3892b123aa4483d672acb70"},{index:1,sourceBlock:54,language:"json",text:`{
  "ticketKey": "BUG-101",
  "title": "修复登录后的跳转问题"
}
`,sha256:"9f958d7ca1c3e8578d001bab820e7440d6c4b2a9570fcec771cae4117afb9920"},{index:2,sourceBlock:56,language:"http",text:`HTTP/1.1 201 Created
Location: /api/tenants/{tenantId}/projects/{projectId}/tickets/{id}
`,sha256:"67bdb69ebc860baeeb4faf9c87751b35fe8791ca8fb408752f964ee0b71596e7"},{index:3,sourceBlock:57,language:"json",text:`{
  "id": "服务端生成的工单 UUID",
  "ticketKey": "BUG-101",
  "title": "修复登录后的跳转问题",
  "status": "OPEN"
}
`,sha256:"d8e0f4845f1f18a42de0cd89afbcef86ec03e4b477c370c0d08aaa3b884a017f"},{index:4,sourceBlock:74,language:"java",text:`@Transactional
public TicketView createTicket(
        Actor actor,
        UUID tenantId,
        UUID projectId,
        CreateTicketCommand command) {

    // actor 来自验证后的身份；目标租户仍需授权。
    accessPolicy.requireTicketCreation(
        actor.userId(), tenantId);

    // 查询本身带 tenantId，确保项目属于目标租户。
    projectRepository.findByTenantAndId(tenantId, projectId)
        .orElseThrow(ResourceNotFoundException::new);

    var ticket = Ticket.open(
        UUID.randomUUID(),
        tenantId,
        projectId,
        command.ticketKey(),
        command.title(),
        actor.userId()
    );

    ticketRepository.insert(ticket);
    auditRepository.recordCreated(ticket, actor.userId());

    return TicketView.from(ticket);
}
`,sha256:"da3146d88fb87939fff101ed1980ed3baa0dc7e679afa2a2a5d22c33f9fa22e0"},{index:5,sourceBlock:101,language:"sql",text:`CREATE TABLE project (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    name text NOT NULL,
    PRIMARY KEY (tenant_id, id)
);

CREATE TABLE ticket (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    ticket_key text NOT NULL,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN',
    created_by uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (tenant_id, id),
    CONSTRAINT uq_ticket_key
        UNIQUE (tenant_id, project_id, ticket_key),
    CONSTRAINT fk_ticket_project
        FOREIGN KEY (tenant_id, project_id)
        REFERENCES project (tenant_id, id),
    CONSTRAINT ck_ticket_key
        CHECK (ticket_key ~ '^[A-Z0-9][A-Z0-9-]{0,31}$'),
    CONSTRAINT ck_ticket_title
        CHECK (length(btrim(title)) > 0),
    CONSTRAINT ck_ticket_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE'))
);

CREATE TABLE ticket_audit (
    tenant_id uuid NOT NULL,
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    actor_user_id uuid NOT NULL,
    event_type text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id, ticket_id)
        REFERENCES ticket (tenant_id, id)
);
`,sha256:"73d07e45ff958077fef5498eed0c927e5d39e124e394b7030f76bfc05e56ed3d"},{index:6,sourceBlock:142,language:"json",text:`{
  "code": "TICKET_KEY_CONFLICT",
  "message": "当前项目内已存在这个工单编号",
  "traceId": "一次请求的追踪标识"
}
`,sha256:"f2d5a2ff30e26d2cbb00cd0c1d1200d350b7d4952c7a0ba47aec09031c7acc76"},{index:7,sourceBlock:153,language:"text",text:`Given：用户在租户 A 中的角色是 VIEWER
When：直接向租户 A 的项目提交创建工单请求
Then：返回 403
And：ticket 与 ticket_audit 的记录数都不增加
`,sha256:"a008d46e9986cedcf5dba22dcdc1a00e0e786d85c860ae76fafe8e9a0ab923c2"}],A=[{index:0,sourceBlock:13,rows:[["位置","本系列选择","学习重点"],["前端","React + TypeScript，沿用熟悉的构建方式","服务端状态、错误恢复、权限交互、并发冲突提示"],["核心后端","Java 21 + Spring Boot 4.1.x","用例组织、授权、事务、业务规则、可测试性"],["数据库","PostgreSQL 18","SQL、关系建模、约束、索引、事务与迁移"],["BFF / 工具服务","Node.js 24 LTS；需要结构化框架时使用 NestJS","页面聚合、会话适配、超时与失败处理"],["运行环境","Docker Compose + 反向代理 + CI/CD","配置、发布、日志、备份、恢复"],["后续组件","Redis、后台任务、对象存储","在具体需求出现时学习缓存和异步处理"]]},{index:1,sourceBlock:20,rows:[["能力","自测问题","能力证据"],["业务建模","需求只有一句话时，能否列清实体、关系、权限和状态规则？","数据模型、规则清单、接口契约"],["数据正确性","两个请求同时修改或创建时，结果是否仍符合规则？","唯一约束、事务、并发用例"],["资源授权","已登录用户修改 URL 中的 ID，能否访问别人的数据？","越权测试和租户隔离规则"],["故障处理","超时发生后，如何判断业务到底成功没有？","幂等策略、错误契约、追踪日志"],["性能分析","接口慢时，能否区分 SQL、网络、连接池和外部服务？","执行计划、指标和定位记录"],["运行交付","能否发布、升级数据库、恢复备份并定位生产问题？","部署说明、恢复演练和运行手册"]]},{index:2,sourceBlock:28,rows:[["阶段成果","你要能展示什么"],["功能闭环","页面提交后写入真实数据库，刷新仍能查询"],["正确性闭环","非法状态、重复业务编号和并发修改都有明确结果"],["安全闭环","直接调用 API 也不能越权，列表、详情和文件权限一致"],["运行闭环","能发布、追踪故障、执行数据库升级并恢复备份"]]},{index:3,sourceBlock:32,rows:[["篇","主题","本篇交付成果"],["01","从前端/BFF 走向完整业务交付","创建工单的职责、规则、失败路径与验收清单"],["02","跑通第一条真实业务链路","React → Spring Boot → PostgreSQL 的可运行功能"],["03","API 契约、校验与错误处理","稳定的请求、响应、状态码和错误结构"],["04","业务建模与关系建模","用户、团队、成员、项目、工单的数据模型"],["05","SQL、关联查询与数据库迁移","可重复建库、升级、初始化和查询"],["06","Spring Boot 的业务代码组织","按业务模块组织 Controller、Service、Repository"],["07","事务与业务一致性","工单和审计记录共同提交、共同回滚"],["08","并发、幂等与状态转换","两人同时编辑、超时重试和非法状态变更的处理"],["09","身份认证与登录态","接入身份系统，理解会话与令牌生命周期"],["10","授权、RBAC 与租户隔离","资源级权限判断和全链路租户作用域"],["11","Web 安全与输入边界","CSRF、XSS、注入、CORS 在项目中的处理"],["12","稳定的前后端交互","加载、取消、重试、乐观更新和冲突恢复"],["13","有意义的自动化测试","真实数据库、权限拒绝、事务回滚和关键并发测试"],["14","SQL 性能、索引与分页","读执行计划、定位慢查询、选择合适分页方式"],["15","Redis 缓存与一致性","缓存一个适合的查询，定义失效与陈旧容忍度"],["16","异步任务、Outbox 与可靠重试","持久化任务、重试、失败状态和重复消费处理"],["17","文件上传与批量导入导出","上传权限、逐行校验、错误报告和受控下载"],["18","Node BFF 的合理应用","聚合工单概览；对照 Node 与 Java 的用例组织"],["19","日志、指标与链路追踪","从页面报错追到服务、SQL 或后台任务"],["20","容器、配置与应用生命周期","可复现启动、健康检查、配置分离和正常退出"],["21","反向代理、域名与 HTTPS","完整访问链路，以及 Cookie、代理和跨域排障"],["22","CI/CD 与数据库变更","构建、校验、发布和向前兼容的数据库升级"],["23","压测、备份恢复与故障处理","一次有目标的压测和一次真实恢复演练"],["24","项目验收与全栈能力展示","可运行项目、设计说明、运行手册和成果表达"]]},{index:4,sourceBlock:64,rows:[["位置","本例中的职责"],["React 页面","收集输入、提供即时校验、展示请求状态和可理解的错误"],["认证组件","验证凭据，构造可信的当前用户身份"],["Controller","接收 HTTP 参数，执行请求格式校验，调用业务用例，映射响应"],["Service / 用例层","判断成员角色、核实项目归属、执行创建规则、组织事务"],["Repository","执行带租户作用域的查询与写入"],["PostgreSQL","保存数据，通过约束保障可表达的数据不变量"],["运行观测","记录请求关联信息、异常和耗时，支撑问题定位"]]},{index:5,sourceBlock:111,rows:[["时刻","请求 A","请求 B"],["1","查询：不存在",""],["2","","查询：不存在"],["3","执行插入",""],["4","","执行插入"]]},{index:6,sourceBlock:119,rows:[["问题","本质","本项目的例子"],["业务唯一性","哪些数据在业务上不允许同时存在？","同一项目不能有两个 BUG-101"],["请求幂等","同一次操作执行多次，怎样避免产生额外业务效果？","第一次创建已成功，但客户端超时后再次提交"]]},{index:7,sourceBlock:139,rows:[["情况","响应约定"],["成功创建并提交","201，返回新资源和 Location"],["参数格式或输入规则不满足","400；本系列统一使用这一约定"],["凭据缺失、失效或无效","401，由认证层提供适用的 WWW-Authenticate"],["身份有效，但角色不允许创建","403"],["项目不存在，或按既定策略隐藏无权访问资源","404"],["业务编号冲突","409，返回稳定的业务错误码"],["未预期的内部故障","合适的 5xx，客户端拿到可追踪标识"]]},{index:8,sourceBlock:149,rows:[["验证场景","预期结果"],["MEMBER 在所属租户的项目中创建合法工单","201；有一条工单和一条创建审计"],["VIEWER 直接调用创建 API","403；工单和审计都不增加"],["修改 tenantId / projectId，访问其他租户资源","按既定 403/404 策略拒绝；不泄露数据、不产生写入"],["绕过前端提交空标题","400；不产生写入"],["同一项目并发创建同一业务编号","至多一条工单成功提交；冲突得到可识别结果"],["模拟审计写入失败","工单写入回滚；没有“工单成功但缺审计”的结果"],["创建成功后刷新页面","能从数据库重新查到该工单"],["响应在提交后丢失","能说明结果不确定；第 08 篇完善查询与幂等重试"]]}],R=[{index:0,sourceBlock:7,level:1,id:"fullstack-heading-01",text:"一、适合你的学习路线"},{index:1,sourceBlock:8,level:2,id:"fullstack-heading-02",text:"1. 技术主线怎么选？"},{index:2,sourceBlock:15,level:3,id:"fullstack-heading-03",text:"BFF 什么时候加入？"},{index:3,sourceBlock:18,level:2,id:"fullstack-heading-04",text:"2. 优先核查的六项能力"},{index:4,sourceBlock:23,level:1,id:"fullstack-heading-05",text:"二、贯穿项目：TeamFlow 团队工单平台"},{index:5,sourceBlock:31,level:1,id:"fullstack-heading-06",text:"三、24 篇课程安排"},{index:6,sourceBlock:38,level:1,id:"fullstack-heading-07",text:"第 01 篇：从“把接口接通”到“对业务结果负责”"},{index:7,sourceBlock:41,level:2,id:"fullstack-heading-08",text:"1. 先改变“做完了”的判断标准"},{index:8,sourceBlock:49,level:2,id:"fullstack-heading-09",text:"2. 先写业务规则，再写接口"},{index:9,sourceBlock:63,level:2,id:"fullstack-heading-10",text:"3. 把一条请求拆成明确职责"},{index:10,sourceBlock:68,level:3,id:"fullstack-heading-11",text:"互动：改变场景，观察责任位置"},{index:11,sourceBlock:70,level:3,id:"fullstack-heading-12",text:"创建工单：责任边界模拟"},{index:12,sourceBlock:72,level:2,id:"fullstack-heading-13",text:"4. 工程案例：一个创建用例怎样组织？"},{index:13,sourceBlock:76,level:3,id:"fullstack-heading-14",text:"① 当前用户与请求数据分开"},{index:14,sourceBlock:79,level:3,id:"fullstack-heading-15",text:"② 权限有明确策略"},{index:15,sourceBlock:82,level:3,id:"fullstack-heading-16",text:"③ 查询带业务作用域"},{index:16,sourceBlock:86,level:3,id:"fullstack-heading-17",text:"④ 业务对象维护自身规则"},{index:17,sourceBlock:90,level:3,id:"fullstack-heading-18",text:"⑤ 相关写入共同提交"},{index:18,sourceBlock:98,level:2,id:"fullstack-heading-19",text:"5. 数据库约束：把规则落到数据上"},{index:19,sourceBlock:107,level:3,id:"fullstack-heading-20",text:"为什么“先查再插入”仍然会重复？"},{index:20,sourceBlock:117,level:2,id:"fullstack-heading-21",text:"6. 业务唯一性和请求幂等，要分开设计"},{index:21,sourceBlock:125,level:2,id:"fullstack-heading-22",text:"7. 本地事务能覆盖到哪里？"},{index:22,sourceBlock:137,level:2,id:"fullstack-heading-23",text:"8. 错误响应也是接口契约的一部分"},{index:23,sourceBlock:147,level:2,id:"fullstack-heading-24",text:"9. 课后工程练习：定义“创建工单完成了”"},{index:24,sourceBlock:150,level:3,id:"fullstack-heading-25",text:"本次作业包含三个产物"},{index:25,sourceBlock:157,level:2,id:"fullstack-heading-26",text:"10. 自测：6 道选择题"},{index:26,sourceBlock:159,level:3,id:"fullstack-heading-27",text:"第 1 题：已登录用户改了租户 ID，服务端应怎样处理？"},{index:27,sourceBlock:163,level:3,id:"fullstack-heading-28",text:"第 2 题：两个请求都查到 BUG-101 不存在，谁最终保障编号唯一？"},{index:28,sourceBlock:167,level:3,id:"fullstack-heading-29",text:"第 3 题：同一有效事务里，审计写入抛出未吞掉的运行时异常，会怎样？"},{index:29,sourceBlock:171,level:3,id:"fullstack-heading-30",text:"第 4 题：复合外键 (tenant_id, project_id) 最直接保障什么？"},{index:30,sourceBlock:175,level:3,id:"fullstack-heading-31",text:"第 5 题：工单已提交，但通知发送失败，后续应怎样提高可靠性？"},{index:31,sourceBlock:179,level:3,id:"fullstack-heading-32",text:"第 6 题：每次重试都生成新 UUID 和新业务编号，为什么仍可能创建逻辑重复工单？"},{index:32,sourceBlock:184,level:2,id:"fullstack-heading-33",text:"如何判断可以进入下一篇？"}],O=[{id:1,title:"已登录用户改了租户 ID，服务端应怎样处理？",options:[{key:"A",text:"JWT 有效就执行。"},{key:"B",text:"校验目标租户成员关系、资源归属和目标动作权限。"},{key:"C",text:"UUID 很难猜，可以省略检查。"}],correct:"B",explanation:"有效身份只说明请求者是谁，仍要判断目标资源与动作是否获准。"},{id:2,title:"两个请求都查到 BUG-101 不存在，谁最终保障编号唯一？",options:[{key:"A",text:"前端禁用按钮。"},{key:"B",text:"查询之后立刻插入。"},{key:"C",text:"数据库中的对应唯一约束。"}],correct:"C",explanation:"查询和写入之间存在竞争窗口，数据库约束才能约束同时到来的写入。"},{id:3,title:"同一有效事务里，审计写入抛出未吞掉的运行时异常，会怎样？",options:[{key:"A",text:"工单和审计写入共同回滚。"},{key:"B",text:"工单保留、审计丢失。"},{key:"C",text:"自动向用户发送补偿邮件。"}],correct:"A",explanation:"题设已经限定同一事务、事务生效和符合默认回滚规则的异常传播。"},{id:4,title:"复合外键 (tenant_id, project_id) 最直接保障什么？",options:[{key:"A",text:"SELECT 自动按租户过滤。"},{key:"B",text:"当前用户一定是管理员。"},{key:"C",text:"工单引用同一租户中存在的项目。"}],correct:"C",explanation:"外键保障引用关系；读取范围和调用者授权仍然要单独实现。"},{id:5,title:"工单已提交，但通知发送失败，后续应怎样提高可靠性？",options:[{key:"A",text:"把浏览器超时设置得足够长。"},{key:"B",text:"同事务保存 Outbox 事件，后台发送、重试并处理重复投递。"},{key:"C",text:"认为数据库事务会撤销外部邮件。"}],correct:"B",explanation:"持久化发送意图后，进程重启仍有机会继续执行；通知重复问题也需要处理。"},{id:6,title:"每次重试都生成新 UUID 和新业务编号，为什么仍可能创建逻辑重复工单？",options:[{key:"A",text:"数据库不能使用 UUID。"},{key:"B",text:"所有 POST 都必须禁止重试。"},{key:"C",text:"唯一技术标识没有识别“这是同一次业务操作”。"}],correct:"C",explanation:"技术标识唯一、业务编号唯一和请求幂等，是三个需要分别定义的保证。"}],P={normal:{results:["已提交","校验通过","工单与审计已提交","本课尚未接入"],focus:"database",detail:"模拟结果：数据库提交后创建成立；通知属于后续工作。"},invalid:{results:["被绕过","拒绝：标题为空","未写入","未触发"],focus:"service",detail:"模拟结果：服务端拦截无效输入；前端校验可被绕过。"},tenant:{results:["提交了越权请求","拒绝：无目标项目权限","未写入","未触发"],focus:"service",detail:"模拟结果：身份有效仍须验证目标租户与项目的操作权限。"},duplicate:{results:["两个请求同时到达","均通过格式与权限检查","1 次成功 · 1 次唯一冲突","后续仅成功项触发"],focus:"database",detail:"模拟结果：唯一约束守住业务编号；重试复用结果仍需幂等协议。"},email:{results:["收到创建成功","业务操作已完成","工单与审计已提交","发送失败 · 待重试"],focus:"notification",detail:"后续方案模拟：邮件失败不撤销已提交工单；可靠重试需 Outbox 等机制。"}},F=[{index:1,key:"spring",title:"Spring Boot 系统要求",url:"https://docs.spring.io/spring-boot/system-requirements.html"},{index:2,key:"node",title:"Node.js 发布与支持状态",url:"https://nodejs.org/en/about/previous-releases"},{index:3,key:"bff",title:"Microsoft BFF 架构模式",url:"https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends"},{index:4,key:"auth",title:"OWASP 授权检查",url:"https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"},{index:5,key:"tx-proxy",title:"Spring 声明式事务代理",url:"https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html"},{index:6,key:"tx-rollback",title:"Spring 事务回滚规则",url:"https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html"},{index:7,key:"constraints",title:"PostgreSQL 数据约束",url:"https://www.postgresql.org/docs/current/ddl-constraints.html"},{index:8,key:"isolation",title:"PostgreSQL 事务隔离",url:"https://www.postgresql.org/docs/current/transaction-iso.html"},{index:9,key:"outbox",title:"Transactional Outbox",url:"https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"},{index:10,key:"http",title:"RFC 9110 HTTP 语义",url:"https://www.rfc-editor.org/rfc/rfc9110.html"}],D={blocks:189,codeBlocks:8,tables:9,headings:33,questions:6},j={schemaVersion:C,source:S,normalization:q,blocks:y,codeBlocks:U,tables:A,headings:R,questions:O,scenarios:P,references:F,counts:D};const z=["innerHTML"],w=L({__name:"FullstackBusinessLesson",setup(x){const s=I(null),o=j.questions,g={normal:{results:["已提交","校验通过","工单与审计已提交","本课尚未接入"],focus:"database",detail:"模拟结果：数据库提交后创建成立；通知属于后续工作。"},invalid:{results:["被绕过","拒绝：标题为空","未写入","未触发"],focus:"service",detail:"模拟结果：服务端拦截无效输入；前端校验可被绕过。"},tenant:{results:["提交了越权请求","拒绝：无目标项目权限","未写入","未触发"],focus:"service",detail:"模拟结果：身份有效仍须验证目标租户与项目的操作权限。"},duplicate:{results:["两个请求同时到达","均通过格式与权限检查","1 次成功 · 1 次唯一冲突","后续仅成功项触发"],focus:"database",detail:"模拟结果：唯一约束守住业务编号；重试复用结果仍需幂等协议。"},email:{results:["收到创建成功","业务操作已完成","工单与审计已提交","发送失败 · 待重试"],focus:"notification",detail:"后续方案模拟：邮件失败不撤销已提交工单；可靠重试需 Outbox 等机制。"}};let b=!1;function f(t){const e=s.value,a=g[t];if(!e||!a)return;e.querySelectorAll("#fs-boundaries [data-layer]").forEach((d,r)=>{const l=d.querySelector(".fs-result");l&&(l.textContent=a.results[r]??""),d.classList.toggle("fs-focus",d.dataset.layer===a.focus)});const c=e.querySelector("#fs-detail");c&&(c.textContent=a.detail)}function T(t){const e=t.target;if(e instanceof HTMLSelectElement&&e.id==="fs-scenario"){f(e.value);return}if(b&&e instanceof HTMLInputElement&&e.type==="radio"&&e.closest("#course-quiz")){const a=s.value,c=a==null?void 0:a.querySelector("#quiz-score");c&&(c.textContent="答案已修改，请重新提交评分"),a==null||a.querySelectorAll(".quiz-verdict").forEach(d=>{d.textContent=""}),a==null||a.querySelectorAll("[data-quiz-result]").forEach(d=>{delete d.dataset.quizResult}),b=!1}}function N(t){const e=t.target;if(!(e instanceof HTMLFormElement)||e.id!=="course-quiz")return;t.preventDefault();const a=s.value;if(!a)return;let c=0,d=0;for(const l of o){const i=e.querySelector('input[name="q'+l.id+'"]:checked'),u=(i==null?void 0:i.value)===l.correct;i&&d++,u&&c++;const n=a.querySelector("#feedback-"+l.id);if(!n)continue;n.hidden=!1,n.dataset.quizResult=i?u?"correct":"incorrect":"unanswered";const k=n instanceof HTMLDetailsElement?n:n.closest("details");k&&(k.open=!0);const p=n.querySelector(".quiz-verdict");p&&(p.textContent=i?u?"回答正确":"本题需要回看":"未作答")}const r=a.querySelector("#quiz-score");r&&(r.textContent="得分 "+c+" / "+o.length+" · 已作答 "+d+" / "+o.length),b=!0}return E(()=>{var e;const t=(e=s.value)==null?void 0:e.querySelector("#fs-scenario");t&&f(t.value)}),(t,e)=>(h(),v("article",{id:"fullstack-article",ref_key:"article",ref:s,class:"fullstack-lesson","aria-label":"前端转全栈：系列总纲与第 01 篇",onChange:T,onSubmit:N,innerHTML:_(B)},null,40,z))}}),H=JSON.parse('{"title":"系列总纲与第 01 篇：从“把接口接通”到“对业务结果负责”","description":"面向有 Node BFF 和 Spring Boot 经验的前端开发者：24 篇全栈课程路线、创建工单的职责与事务边界、场景练习和 6 道完整自测题。","frontmatter":{"title":"系列总纲与第 01 篇：从“把接口接通”到“对业务结果负责”","description":"面向有 Node BFF 和 Spring Boot 经验的前端开发者：24 篇全栈课程路线、创建工单的职责与事务边界、场景练习和 6 道完整自测题。","outline":false},"headers":[],"relativePath":"guide/fullstack-course/01-from-bff-to-business-backend.md","filePath":"guide/fullstack-course/01-from-bff-to-business-backend.md","lastUpdated":1793118415000}'),K={name:"guide/fullstack-course/01-from-bff-to-business-backend.md"},M=Object.assign(K,{setup(x){return(s,o)=>(h(),v("div",null,[m(w)]))}});export{H as __pageData,M as default};
