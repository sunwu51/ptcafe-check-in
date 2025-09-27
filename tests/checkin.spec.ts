import { test } from '@playwright/test';


test('login page', async ({ page }) => {
  const maxRetries = 3;
  let loginSuccess = false;
  
  for (let attempt = 1; attempt <= maxRetries && !loginSuccess; attempt++) {
    try {
      console.log('正在访问登录页面...');
      await page.goto('https://ptcafe.club/login.php', {
        waitUntil: 'networkidle'
      });
      
      // 等待表单元素出现
      await page.waitForSelector('input#submit-btn', { timeout: 10000 });
      
      // 大模型识别验证码
      const captchaImg = await page.waitForSelector('img[alt="CAPTCHA"]', { timeout: 5000 })
      let captchaUrl = await captchaImg.getAttribute('src');
      if (!captchaUrl) {
        throw new Error('验证码图片没有src属性');
      }
      // 转换为绝对URL
      if (captchaUrl.startsWith('/')) {
        captchaUrl = 'https://ptcafe.club' + captchaUrl;
      } else if (captchaUrl.startsWith('./')) {
        captchaUrl = 'https://ptcafe.club/' + captchaUrl.substring(2);
      } else if (!captchaUrl.startsWith('http')) {
        captchaUrl = 'https://ptcafe.club/' + captchaUrl;
      }

      const captcha = await recognizeCaptcha(captchaUrl)

      console.log('正在填写登录信息...');
      
      // 清空并填写用户名
      await page.fill('input.username', '');
      await page.type('input.username', process.env.USERNAME!!, { delay: 100 });
      
      // 清空并填写密码
      await page.fill('input.password', '');
      await page.type('input.password', process.env.PASSWORD!!, { delay: 100 });

      // 清空并填写验证码
      await page.fill('input[name=imagestring]', '')
      await page.type('input[name=imagestring]', captcha, { delay: 100 })
      
      console.log('正在点击登录按钮...');
      
      // 点击登录按钮
      await page.click('input#submit-btn');
      await page.waitForLoadState('networkidle');

      // 登录成功还是失败
      let failWhenLogin = false 
      const h2Elements = await page.$$('h2');
      for (const h2 of h2Elements) {
        const text = await h2.textContent();
        if (text && text.includes('失败')) {
          failWhenLogin = true;
          console.log("登录失败，进行重试。")
        }
      }
      if (failWhenLogin) {
        continue;
      }

      // 跳转签到
      await page.goto('https://ptcafe.club/attendance.php')
      await page.waitForLoadState('networkidle')
      loginSuccess = true
      console.log('签到完成');
    } catch (error) {
      console.error('执行过程中出现错误:', error);
    }
  }
  // 截图保存
  try {
    await page.screenshot({ 
      path: `checkin-${Date.now()}.png`,
      fullPage: true 
    });
  } catch (e) {
    console.error(e)
  }

  if (!loginSuccess) {
    throw new Error("签到失败")
  }
})
async function recognizeCaptcha(imageUrl) {
  try {
    console.log('正在识别验证码图片:', imageUrl);
    const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别这个验证码图片中的文字，只返回识别出的字符，不要包含任何其他文字或解释。如果是数字和字母的组合，请按顺序返回所有字符。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API 请求失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    const captchaText = data.choices[0].message.content.trim();
    
    console.log('识别出的验证码:', captchaText);
    return captchaText;
    
  } catch (error) {
    console.error('验证码识别失败:', error);
    throw error;
  }
}
