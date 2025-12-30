// DOM 元素
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const eventInput = document.getElementById('eventInput');
    const shakeBtn = document.getElementById('shakeBtn');
    const hexagramSection = document.getElementById('hexagramSection');
    const resultSection = document.getElementById('resultSection');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const fullInterpretation = document.getElementById('fullInterpretation');

    // 八卦数据库
    const trigrams = {
        '乾': { symbol: [1, 1, 1], meaning: '天 - 刚健、创造' },
        '坤': { symbol: [0, 0, 0], meaning: '地 - 柔顺、承载' },
        '震': { symbol: [0, 0, 1], meaning: '雷 - 震动、奋起' },
        '巽': { symbol: [1, 1, 0], meaning: '风 - 顺从、渗透' },
        '坎': { symbol: [0, 1, 0], meaning: '水 - 险陷、流动' },
        '离': { symbol: [1, 0, 1], meaning: '火 - 光明、附着' },
        '艮': { symbol: [1, 0, 0], meaning: '山 - 静止、阻止' },
        '兑': { symbol: [1, 1, 0], meaning: '泽 - 喜悦、交流' }
    };

    // 检查是否已保存 API Key
    const savedApiKey = localStorage.getItem('moonshot_api_key');
    if (!savedApiKey) {
        // 第一次使用，显示 API Key 输入框
        apiKeyModal.classList.add('show');
    }

    // 保存 API Key
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('moonshot_api_key', apiKey);
            apiKeyModal.classList.remove('show');
            showMessage('API Key 已保存！');
        } else {
            showMessage('请输入有效的 API Key', 'error');
        }
    });

    // 设置按钮 - 允许重新设置 API Key
    settingsBtn.addEventListener('click', function() {
        const currentApiKey = localStorage.getItem('moonshot_api_key');
        if (currentApiKey) {
            apiKeyInput.value = currentApiKey;
        }
        apiKeyModal.classList.add('show');
    });

    // 摇卦按钮
    shakeBtn.addEventListener('click', function() {
        const eventText = eventInput.value.trim();
        if (!eventText) {
            showMessage('请先输入您要占卜的事件', 'error');
            return;
        }

        // 检查 API Key
        const apiKey = localStorage.getItem('moonshot_api_key');
        if (!apiKey) {
            apiKeyModal.classList.add('show');
            showMessage('请先设置 Moonshot API Key', 'error');
            return;
        }

        // 生成六爻卦象
        const hexagramLines = generateHexagramLines();
        displayHexagram(hexagramLines);

        // 隐藏之前的结果
        resultSection.style.display = 'none';
        fullInterpretation.innerHTML = '';

        // 显示加载动画
        loadingIndicator.style.display = 'flex';
        resultSection.style.display = 'block';

        // 生成完整的图形化卦象解读
        generateHexagramVisualization(hexagramLines, eventText);

        // 生成卦象描述
        const hexagramDesc = generateHexagramDescription(hexagramLines);

        // 调用 AI API 解读卦象
        getAIInterpretation(apiKey, eventText, hexagramLines, hexagramDesc);
    });

    // 点击次数统计
    let clickCount = 0;
    shakeBtn.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 3) {
            showMessage('六爻已生成！AI正在为您解读...', 'success');
            clickCount = 0;
        }
    });

    // 生成六爻
    function generateHexagramLines() {
        const lines = [];
        for (let i = 0; i < 6; i++) {
            // 使用随机数决定是阳爻（实线）还是阴爻（断线）
            const isYang = Math.random() > 0.5;
            lines.push(isYang ? 1 : 0); // 1 表示阳爻，0 表示阴爻
        }
        return lines;
    }

    // 显示卦象
    function displayHexagram(lines) {
        hexagramSection.style.display = 'block';

        const yaoElements = hexagramSection.querySelectorAll('.yao-symbol');
        const yaoNumbers = hexagramSection.querySelectorAll('.yao-number');

        // 六爻在显示时是从下到上，数组中是从上到下
        lines.forEach((line, index) => {
            const yao = yaoElements[index];
            const yaoNumber = yaoNumbers[index];

            if (line === 1) {
                // 阳爻
                yao.className = 'yao-symbol';
                yaoNumber.textContent = yaoNumber.textContent.replace('六', '九');
            } else {
                // 阴爻
                yao.className = 'yao-symbol broken';
                yaoNumber.textContent = yaoNumber.textContent.replace('九', '六');
            }
        });

        // 添加摇卦动画
        shakeBtn.classList.add('shaking');
        setTimeout(() => {
            shakeBtn.classList.remove('shaking');
        }, 500);
    }

    // 生成卦象描述
    function generateHexagramDescription(lines) {
        // 从下到上（实际显示顺序）生成描述
        const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        const descriptions = [
            '此事的开端，奠定基础',
            '分内之事，积累过程',
            '进展中的变化，需谨慎',
            '外部影响，关系发展',
            '最终结果，成败关键',
            '最终状态，超出预期'
        ];
        const descriptionsYinYang = [
            '初始阶段，潜龙勿用',
            '逐渐显现，见龙在田',
            '终日乾乾，反复道也',
            '或跃在渊，无咎',
            '飞龙在天，利见大人',
            '亢龙有悔，盈不可久'
        ];

        const description = [];
        lines.forEach((line, index) => {
            const pos = positions[index];
            const type = line === 1 ? '阳爻' : '阴爻';
            const baseDesc = descriptions[index];
            const yinYangDesc = descriptionsYinYang[index];
            description.push(`${pos}（${type}）：${baseDesc}；${yinYangDesc}`);
        });

        return description.join('\n');
    }

    // 识别八卦
    function identifyTrigram(threeLines) {
        for (const [name, data] of Object.entries(trigrams)) {
            if (JSON.stringify(data.symbol) === JSON.stringify(threeLines)) {
                return { name, ...data };
            }
        }
        return null;
    }

    // 生成图形化卦象展示
    function generateHexagramVisualization(lines, eventText) {
        // 清除之前的内容
        document.getElementById('visualHexagram').innerHTML = '';
        document.getElementById('hexagramName').innerHTML = '';
        document.getElementById('upperTrigram').innerHTML = '';
        document.getElementById('upperMeaning').innerHTML = '';
        document.getElementById('lowerTrigram').innerHTML = '';
        document.getElementById('lowerMeaning').innerHTML = '';
        document.getElementById('yaoList').innerHTML = '';
        document.getElementById('eventTextDisplay').textContent = eventText;

        // 1. 主要卦象图形展示
        const visualHexagram = document.getElementById('visualHexagram');
        const yinYangIndicator = document.createElement('div');
        yinYangIndicator.className = 'yin-yang-indicator';
        visualHexagram.appendChild(yinYangIndicator);

        lines.forEach((line, index) => {
            const visualYao = document.createElement('div');
            visualYao.className = line === 1 ? 'visual-yao' : 'visual-yao broken';
            visualYao.style.animation = 'fadeInUp 0.5s ease forwards';
            visualYao.style.animationDelay = `${index * 0.1}s`;
            visualHexagram.appendChild(visualYao);
        });

        // 2. 生成卦名
        const upperTrigramLines = lines.slice(0, 3);
        const lowerTrigramLines = lines.slice(3);
        const upperTrigram = identifyTrigram(upperTrigramLines.reverse());
        const lowerTrigram = identifyTrigram(lowerTrigramLines.reverse());

        const hexagramName = document.getElementById('hexagramName');
        if (upperTrigram && lowerTrigram) {
            hexagramName.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 5px;">
                    ${upperTrigram.name}${lowerTrigram.name}卦
                </div>
                <div style="font-size: 14px; color: #666;">
                    ${upperTrigramLines.filter(l => l === 1).length > upperTrigramLines.filter(l => l === 0).length ? '阳' : '阴'}多${lowerTrigramLines.filter(l => l === 1).length > lowerTrigramLines.filter(l => l === 0).length ? '阳' : '阴'}少
                </div>
            `;
        }

        // 3. 卦象结构分析
        if (upperTrigram) {
            const upperTrigramDiv = document.getElementById('upperTrigram');
            upperTrigram.symbol.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = line === 1 ? 'trigram-line' : 'trigram-line broken';
                upperTrigramDiv.appendChild(lineDiv);
            });
            document.getElementById('upperMeaning').textContent = upperTrigram.meaning;
        }

        if (lowerTrigram) {
            const lowerTrigramDiv = document.getElementById('lowerTrigram');
            lowerTrigram.symbol.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = line === 1 ? 'trigram-line' : 'trigram-line broken';
                lowerTrigramDiv.appendChild(lineDiv);
            });
            document.getElementById('lowerMeaning').textContent = lowerTrigram.meaning;
        }

        // 4. 六爻详解
        const yaoList = document.getElementById('yaoList');
        const positionNames = ['初', '二', '三', '四', '五', '上'];
        const phaseNames = ['此事开端', '过程积累', '发展变化', '外部影响', '成败关键', '最终结果'];
        const yaoMeanings = [
            '初始阶段，宜静不宜动，积蓄力量',
            '逐渐发展，宜守中道，稳步前进',
            '处于转折，需谨慎决策，避免冒进',
            '向外发展，宜寻求合作，借助外力',
            '达到顶峰，把握机遇，大展宏图',
            '盛极而衰，宜收敛锋芒，保持谨慎'
        ];

        // 从下到上显示，但需要对应的正确顺序的爻辞
        lines.reverse().forEach((line, index) => {
            const yaoItem = document.createElement('div');
            yaoItem.className = 'yao-item';
            yaoItem.style.animation = 'fadeInUp 0.5s ease forwards';
            yaoItem.style.animationDelay = `${index * 0.1}s`;

            const positionInfo = document.createElement('div');
            positionInfo.className = 'yao-position-info';
            positionInfo.innerHTML = `
                <span class="yao-name">${positionNames[index]}${line === 1 ? '九' : '六'}</span>
                <span class="yao-phase">${phaseNames[index]}</span>
            `;

            const symbolDisplay = document.createElement('div');
            symbolDisplay.className = line === 1 ? 'yao-symbol-display' : 'yao-symbol-display broken';

            const description = document.createElement('div');
            description.className = 'yao-description';
            const yinYangDesc = line === 1
                ? '阳爻：刚健有力，积极进取'
                : '阴爻：柔顺内敛，以静制动';
            description.innerHTML = `
                <strong>${yinYangDesc}</strong>
                ${yaoMeanings[index]}
            `;

            yaoItem.appendChild(positionInfo);
            yaoItem.appendChild(symbolDisplay);
            yaoItem.appendChild(description);
            yaoList.appendChild(yaoItem);
        });

        // 5. 总结信息
        const yangCount = lines.filter(l => l === 1).length;
        const yinCount = lines.filter(l => l === 0).length;

        // 卦象总论
        const overallSummary = document.getElementById('overallSummary');
        if (yangCount > yinCount) {
            overallSummary.textContent = '此卦阳爻居多，整体趋向积极、主动、刚健。适合开拓进取，把握时机。但需注意刚过易折，应保持适度弹性。';
        } else if (yinCount > yangCount) {
            overallSummary.textContent = '此卦阴爻居多，整体趋向内敛、柔顺、稳重。适合守成持重，静待时机。应防止过于保守，错失良机。';
        } else {
            overallSummary.textContent = '此卦阴阳平衡，动静相宜，刚柔并济。适合稳步发展，既要积极进取，又要保持谨慎，把握节奏。';
        }

        // 发展趋势
        const trendDescription = document.getElementById('trendDescription');
        const firstThree = lines.slice(0, 3).filter(l => l === 1).length;
        const lastThree = lines.slice(3).filter(l => l === 1).length;

        if (firstThree > lastThree) {
            trendDescription.textContent = '初始阶段较为刚健主动，但后续发展趋于平稳，整体呈收敛态势。建议把握前期机遇，后期稳健经营。';
        } else if (lastThree > firstThree) {
            trendDescription.textContent = '前期较为平稳内敛，但后期逐渐增强，整体呈上升态势。建议积蓄力量，等待后期大展宏图。';
        } else {
            trendDescription.textContent = '整个过程发展平稳，没有大的起伏。适合按部就班，稳步推进，保持现状即可。';
        }

        // 建议指导
        const guidanceDescription = document.getElementById('guidanceDescription');
        if (lines[0] === 1 && lines[5] === 1) {
            guidanceDescription.textContent = '始末皆为阳爻，宜保持积极进取的态度。但需注意始易终难，应做好充分准备，坚持到底。';
        } else if (lines[0] === 0 && lines[5] === 0) {
            guidanceDescription.textContent = '始末皆为阴爻，宜保持谨慎稳重。时机未至时静心等待，时机来临时果断行动。';
        } else if (lines[2] === 1 && lines[3] === 1) {
            guidanceDescription.textContent = '中部阳爻强旺，核心力量充足。应充分发挥自身优势，把握关键环节，必能成就大事。';
        } else {
            guidanceDescription.textContent = '整体卦象平稳，建议保持中庸之道，不急不躁，顺势而为，自然会有好的结果。';
        }
    }

    // 调用 AI API 解读卦象
    async function getAIInterpretation(apiKey, eventText, hexagramLines, hexagramDesc) {
        try {
            // 构建卦象图案
            const hexagramSymbols = hexagramLines.map(line =>
                line === 1 ? '===爻===' : '==爻=='
            ).reverse().join('\n');

            const prompt = `您是一位精通《易经》六爻预测的占卜大师。现在有一位用户想要占卜以下事件：

"${eventText}"

用户通过摇卦得到了以下卦象：
${hexagramSymbols}

其中：
- ===爻=== 代表阳爻（实线）
- ==爻== 代表阴爻（断线）

卦象说明（从下到上）：
${hexagramDesc}

请您作为占卜大师，对这个卦象进行详细的解读和预测：

## 解读要求：

1. **卦象分析**：
   - 先说明这个卦象在《易经》中对应的是哪个卦（根据上下卦组合）
   - 分析卦象的阴阳分布特征
   - 说明每一爻的含义和象征

2. **事件预测**：
   - 结合用户占卜的具体事件，给出针对性的预测
   - 说明此事的吉凶趋势
   - 分析可能遇到的机遇和挑战

3. **时间预测**：
   - 预测此事发展的大致时间节点
   - 说明何时是行动的最佳时机
   - 提醒需要注意的时间点

4. **具体建议**：
   - 给出3-5条具体可行的建议
   - 说明应当采取的策略和态度
   - 提醒需要避免的错误

5. **综合总结**：
   - 总结整体趋势（吉/凶/平）
   - 给出最终的建议和祝福

请用专业、优雅的语言回答，体现《易经》的深邃智慧。不要包含任何 markdown 格式，纯文本即可。语言要简洁明了，避免过于晦涩的术语。`;

            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "kimi-k2-turbo-preview",
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一位精通《易经》六爻预测的占卜大师，有30年的占卜经验。你不仅深谙易经理论，还具备丰富的人生阅历。你的解读要专业准确，语言要优雅得体，能给人智慧和启发。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "stream": false,
                    "max_tokens": 3000,
                    "temperature": 0.7,
                    "top_p": 0.9
                })
            });

            if (!response.ok) {
                throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // 隐藏加载动画
            loadingIndicator.style.display = 'none';

            if (data.choices && data.choices[0] && data.choices[0].message) {
                const interpretation = data.choices[0].message.content;
                displayResult(interpretation);
            } else {
                throw new Error('API 返回格式错误');
            }

        } catch (error) {
            loadingIndicator.style.display = 'none';
            showMessage('解读失败: ' + error.message, 'error');
            fullInterpretation.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 20px;">解读失败，请检查您的 API Key 是否有效，或稍后重试。</p>';
        }
    }

    // 显示解读结果
    function displayResult(interpretation) {
        fullInterpretation.innerHTML = '';

        // 添加标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'interpretation-title';
        titleDiv.textContent = 'AI深度解读';
        fullInterpretation.appendChild(titleDiv);

        // 对文本进行美化和格式化
        const formattedText = formatInterpretationText(interpretation);
        fullInterpretation.innerHTML += formattedText;
    }

    // 格式化解译文本
    function formatInterpretationText(text) {
        // 移除首尾空白
        text = text.trim();

        // 将文本分段
        let paragraphs = text.split(/\n?\n\s*\n\n?|\n\s*\d+\./);

        let html = '';
        let sectionCount = 0;

        // 表情符号库
        const icons = ['🔮', '📊', '💡', '🎯', '⚡', '🌟', '🔥', '💎', '🏆', '✨', '🎪', '🎭', '🎨', '🎬', '🎮', '🎲', '🎰', '🎳'];
        const highlightIcons = ['💡', '🔥', '⭐', '🌟', '✨', '💎', '🏆', '🎖️', '🏅'];
        const warningIcons = ['⚠️', '🚫', '🚨', '🛑', '❌', '📛'];
        const tipIcons = ['✅', '✔️', '💚', '🍀', '🌿', '🌱'];

        // 常见标题关键词
        const sectionKeywords = {
            '卦象': { icon: '🔮', title: '卦象分析' },
            '事件': { icon: '🎯', title: '事件预测' },
            '预测': { icon: '🔮', title: '事件预测' },
            '时间': { icon: '⏰', title: '时间预测' },
            '时机': { icon: '⏰', title: '时间预测' },
            '建议': { icon: '💡', title: '具体建议' },
            '注意': { icon: '⚠️', title: '注意事项' },
            '提醒': { icon: '❗', title: '重要提醒' },
            '机遇': { icon: '🌟', title: '机遇挑战' },
            '挑战': { icon: '⚔️', title: '机遇挑战' },
            '总结': { icon: '🏆', title: '综合总结' },
            '结论': { icon: '✨', title: '综合总结' },
            '说明': { icon: '📝', title: '详细说明' },
            '整体': { icon: '🎪', title: '整体分析' }
        };

        paragraphs.forEach((para, index) => {
            para = para.trim();

            if (!para) return;

            // 检查是否为列表
            if (para.match(/^\d+[).、]|^[-•*]/)) {
                // 处理列表项
                const listItems = para.split(/\n/).map(item => item.trim()).filter(item => item);
                if (listItems.length > 1) {
                    html += '<ul>';
                    listItems.forEach(item => {
                        item = item.replace(/^[-•*]\s*/, '').replace(/^\d+[).、]\s*/, '');
                        if (item) {
                            html += `<li>${addEmojis(item)}</li>`;
                        }
                    });
                    html += '</ul>';
                } else {
                    const item = listItems[0].replace(/^[-•*]\s*/, '').replace(/^\d+[).、]\s*/, '');
                    if (item) {
                        html += `<ul><li>${addEmojis(item)}</li></ul>`;
                    }
                }
            } else {
                // 检查段落是否包含特殊关键词
                let section = null;
                let lowerPara = para.toLowerCase();

                for (const [keyword, config] of Object.entries(sectionKeywords)) {
                    if (lowerPara.includes(keyword.toLowerCase())) {
                        section = config;
                        break;
                    }
                }

                html += '<div class="interpretation-section">';

                if (section && sectionCount < 3) {
                    // 使用识别到的标题
                    html += `<h3><span class="section-icon">${section.icon}</span>${section.title}</h3>`;
                    sectionCount++;
                } else if (sectionCount < 3) {
                    // 生成默认标题
                    const icon = icons[index % icons.length];
                    html += `<h3><span class="section-icon">${icon}</span>解读分析</h3>`;
                    sectionCount++;
                }

                // 处理段落文本，根据内容类型添加不同的表情
                html += `<div class="paragraph">${addEmojis(para)}</div>`;
                html += '</div>';
            }
        });

        return html;
    }

    // 为文本添加表情符号
    function addEmojis(text) {
        // 重要关键信息名单（带有正面表情）
        const importantKeywords = [
            ['./优秀', '✨'], ['./吉利', '🌟'], ['./好运', '🍀'], ['./顺利', '✅'],
            ['./机遇', '🎯'], ['./成功', '🏆'], ['./发展', '📈'], ['./积极', '💪'],
            ['./光明', '☀️'], ['./贵人', '👑'], ['./财运', '💰'], ['./桃花', '🌸'],
            ['./健康', '💚'], ['./升职', '📊'], ['./加薪', '💵'], ['./喜事', '🎉'],
            ['./把握', '⏰'], ['./及时', '⏰'], ['./此刻', '⏰']
        ];

        // 警告关键信息名单（带有负面表情）
        const warningKeywords = [
            ['./谨慎', '⚠️'], ['./小心', '⚠️'], ['./风险', '❌'], ['./困难', '⛰️'],
            ['./挑战', '📊'], ['./破财', '💸'], ['./疾病', '😷'], ['./小人', '🎭'],
            ['./失误', '❗'], ['./不宜', '📛'], ['./阻碍', '🚧'], ['./失望', '😔'],
            ['./挫折', '🥀'], ['./倒霉', '⚡'], ['./不顺利', '🌧️'], ['./出错', '⛔']
        ];

        // 温馨提示（带绿色表情）
        const tipKeywords = [
            ['./建议', '💡'], ['./指导', '📖'], ['./记住', '📝'], ['./重要', '🔥'],
            ['./关键', '☑️'], ['./注意', '❗'], ['./提醒', '🔔'], ['./学习', '📚'],
            ['./参考', '💎'], ['./思考', '❤️'], ['./耐心', '⏱️'], ['./平静', '🧘'],
            ['./冷静', '😌'], ['./准备', '🛡️'], ['./信心', '💪'], ['./努力', '🏃']
        ];

        // 计划时间（带时间表情的）
        const timeKeywords = [
            ['./时间', '⏰'], ['./时机', '⏰'], ['./月份', '📆'], ['./年份', '📅'],
            ['./6月', '🗓️'], ['./7月', '🗓️'], ['./8月', '🗓️'], ['./9月', '🗓️'],
            ['./今年', '📆'], ['./明年', '📅'], ['./后年', '📆'], ['./月开始', '📆']
        ];

        // 处理关键词
        importantKeywords.forEach(([keyword, emoji]) => {
            text = text.replace(new RegExp(keyword, 'gi'), `${emoji} ${keyword.substring(2)}`);
        });

        warningKeywords.forEach(([keyword, emoji]) => {
            text = text.replace(new RegExp(keyword, 'gi'), `${emoji} ${keyword.substring(2)}`);
        });

        tipKeywords.forEach(([keyword, emoji]) => {
            text = text.replace(new RegExp(keyword, 'gi'), `${emoji} ${keyword.substring(2)}`);
        });

        timeKeywords.forEach(([keyword, emoji]) => {
            text = text.replace(new RegExp(keyword, 'gi'), `${emoji} ${keyword.substring(2)}`);
        });

        // 添加其他文本上的装饰
        // 破折号变目录
        text = text.replace(/\n\s*-\s*/g, '<br>• ');
        text = text.replace(/\n\s*•\s*/g, '<br>• ');
        // 用星号包围的文字加粗并添加表情
        text = text.replace(/^\*\*(.*?)\*\*/g, '<strong>🔥 $1</strong>');
        text = text.replace(/\*\*(.*?)\*\*/g, ' <strong>✨ $1</strong>');

        // 特别注意的段落，添加颜色框
        if (text.includes('⚠️') || text.includes('📛')) {
            text = `<div class="warning-box"><span class="emoji">⚠️</span>${text}</div>`;
        } else if (text.includes('💡') || text.includes('💎')) {
            text = `<div class="tip-box"><span class="emoji">💡</span>${text}</div>`;
        } else if (text.includes('⭐') || text.includes('🎯')) {
            text = `<div class="highlight-box"><span class="emoji">💎</span>${text}</div>`;
        }

        return text;
    }

    // 显示消息提示
    function showMessage(msg, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = msg;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            transform: translateX(400px);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        if (type === 'error') {
            messageDiv.style.background = 'rgba(231, 76, 60, 0.9)';
        } else {
            messageDiv.style.background = 'rgba(46, 204, 113, 0.9)';
        }

        document.body.appendChild(messageDiv);

        // 动画显示
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }

    // 回车键触发保存 API Key
    apiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveApiKeyBtn.click();
        }
    });

    // 清空输入框占位符
    eventInput.addEventListener('focus', function() {
        if (this.dataset.placeholder) {
            this.placeholder = this.dataset.placeholder;
            delete this.dataset.placeholder;
        }
    });
});
