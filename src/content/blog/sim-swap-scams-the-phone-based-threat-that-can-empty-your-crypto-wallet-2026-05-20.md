---
type: "blog"
title: "SIM Swap Scams: The Phone-Based Threat That Can Empty Your Crypto Wallet"
slug: "sim-swap-scams-the-phone-based-threat-that-can-empty-your-crypto-wallet-2026-05-20"
summary: "A SIM swap lets a criminal steal your phone number, intercept your SMS codes, and drain your crypto without ever touching your device. Here is how the attack works, what the FBI and FCC data actually show, and the concrete steps that protect you."
category: "Education"
image_url: "https://pubmhnynxpcngxcgwcgf.supabase.co/storage/v1/object/public/blog-images/blog/sim-swap-scams-the-phone-based-threat-that-can-empty-your-crypto-wallet-1779256850771.png"
published: true
auto_generated: false
published_at: "2026-05-20T06:00:51.27+00:00"
updated_at: "2026-06-16T18:00:00Z"
meta_title: "SIM Swap Scams: Protect Your Crypto From Phone Theft"
meta_description: "SIM swap attacks let thieves hijack your phone number and drain crypto wallets. Learn how the scam works, what FBI data shows, and how to defend yourself."
primary_keyword: "sim swap scam crypto"
---

# SIM Swap Scams: The Phone-Based Threat That Can Empty Your Crypto Wallet

Imagine your phone suddenly showing "No Service." You assume it is a network glitch. A few hours later, an email lands on your laptop confirming a withdrawal you never made. By the time you reach your mobile provider, your number has been transferred to a stranger's device and your exchange account is empty.

This is a SIM swap attack, and it is one of the few crypto threats that can defeat a strong password without ever touching your phone, your computer, or your wallet directly. Instead of hacking your device, the attacker hijacks the phone *number* tied to your accounts, then uses it to intercept the codes that protect your money.

This guide explains exactly how SIM swaps work, what the official data tells us about the scale of the problem, and the specific, practical defences that meaningfully reduce your risk. We will be clear about what is proven, what is still uncertain, and what no single tool can guarantee.

## Key takeaways

- **Your phone number is a security weak point, not a vault.** SMS codes can be intercepted the moment your number is ported to an attacker's SIM.
- **SIM swap losses run into the tens of millions of dollars a year** in FBI-reported figures alone, and reported figures almost certainly understate the true total.
- **App-based or hardware-key two-factor authentication (2FA) is far stronger than SMS.** Where a service offers it, prefer a passkey, an authenticator app, or a FIDO2 security key.
- **Self-custody removes the exchange from the equation.** A [hardware wallet](/blog/best-hardware-wallet-2026-ledger-vs-trezor) keeps your private keys offline, so a hijacked phone number alone cannot move your coins.
- **Lock down your mobile account directly with your carrier** using a PIN or port-freeze, and treat your recovery email as a high-value target in its own right.

## What is a SIM swap attack?

A SIM swap (also called SIM jacking or a port-out scam) is a form of account-takeover fraud. The attacker's goal is to take control of your phone number. Crucially, they do this by deceiving your *mobile carrier*, not by breaking into your handset.

The attack usually moves through three stages.

1. **Reconnaissance.** The criminal gathers personal details about you: your full name, date of birth, address, carrier, and phone number. This information often comes from data breaches, public social media profiles, or earlier phishing messages.
2. **Social engineering.** Posing as you, the attacker contacts your carrier's support line or visits a store. They claim the phone was lost or damaged and ask for the number to be moved to a new SIM they already hold. They answer security questions using the data they collected.
3. **The swap.** If staff are convinced, your number is "ported" to the attacker's SIM. Your phone instantly loses service, and every call and text, including 2FA codes and password-reset links, now goes to the criminal.

A real-world example shows how low-tech this can be. In the January 2024 takeover of the U.S. Securities and Exchange Commission's account on X, the perpetrator obtained a victim's personal information, created a fake ID, and presented it at a phone store to obtain a SIM tied to the victim's number. He was later [sentenced to 14 months in prison](https://www.justice.gov/usao-dc/pr/alabama-man-sentenced-hack-sec-x-account-spiked-value-bitcoin) and admitted receiving roughly $50,000 for the swap. The barrier to entry, in other words, is a convincing story and a printed card, not elite hacking skills.

## How big is the problem? What the data shows

It is easy to dismiss SIM swapping as rare. The official numbers suggest otherwise, even though they only capture incidents that victims actually reported.

According to the FBI's Internet Crime Complaint Center (IC3), the picture has shifted year to year:

| Period | SIM swap complaints (US) | Reported losses (US) |
| --- | --- | --- |
| Jan 2018 – Dec 2020 | 320 | ~$12 million |
| 2021 | 1,611 | $68 million+ |
| 2022 | 2,026 | $72.6 million |
| 2023 | 1,075 | $48.8 million |
| 2024 | 982 | $26.0 million |

Sources: the FBI's [2022 public service announcement on SIM swapping](https://www.ic3.gov/PSA/2022/PSA220208) and subsequent IC3 annual reporting.

A few honest caveats about these figures:

- **They are reported losses only.** Many victims never file a complaint, so the true totals are almost certainly higher.
- **Complaint counts falling does not mean the threat is shrinking.** Individual cases can be enormous, and reporting behaviour changes over time.
- **Crypto is over-represented among the largest losses** because crypto transactions are typically irreversible.

That irreversibility point matters. Court cases underline the stakes: U.S. prosecutors have pursued social-engineering crews responsible for hundreds of millions of dollars in crypto theft, including a 2025 case in which a defendant pleaded guilty to a scheme that drained an estimated [$243 million from a single victim](https://www.theblock.co/post/370072/us-justice-dept-files-civil-forfeiture-complaint-for-5-million-in-bitcoin-stolen-via-sim-swap-attacks) using a mix of SIM swaps and fake support calls. We cannot predict whether you will be targeted, but the downside is unusually severe.

## Why crypto is the perfect prize

Why would a criminal go through all of this? Because your phone number has quietly become the master key to your digital life, and crypto is the ideal thing to steal with it.

A bank transfer can often be flagged, frozen, or reversed. A confirmed on-chain crypto transaction generally cannot. Once funds leave an exchange and pass through a few wallets, there is rarely a fraud department to call and no chargeback to issue. That finality is part of what makes self-custody powerful, and also part of what makes theft so painful.

The typical attack chain looks like this:

1. The attacker targets your **email** first, because email is the recovery hub for everything else. They click "Forgot password" and ask for a code by text, which now arrives on their device.
2. Inside your inbox, they search for terms like "Kraken," "Coinbase," "withdrawal," or "wallet" to map every platform you use.
3. They visit each exchange, trigger a password reset, and use your email plus your intercepted SMS codes to bypass weak 2FA.
4. They add their own withdrawal address and move your balance out.

The uncomfortable lesson is that your security is only as strong as its weakest link. A reputable, well-run platform can do everything right and still be bypassed if an attacker walks in through your hijacked phone number. This is a different category of risk from outright fraud such as the schemes we document in our [CryptoMine Pro scam warning](/warnings/cryptomine-pro-scam-warning) and [YieldMax AI scam warning](/warnings/yieldmax-ai-scam-warning). With those, the platform is the threat. With a SIM swap, the threat is the recovery path you did not know you had left open.

## Your biggest weak point: SMS two-factor authentication

For years the advice was simple: turn on 2FA everywhere. That advice is still correct. But the *type* of 2FA matters enormously, and in 2026, relying on SMS text codes is one of the weakest options you can choose.

The Short Message Service was designed in the 1980s for basic messaging. It was never built as a security control. SMS is unencrypted in transit, and, as we have seen, it is bound to a phone number that can be stolen without you losing physical possession of your handset.

Here is how common 2FA methods compare against a SIM swap specifically.

| 2FA method | Resists SIM swap? | Notes |
| --- | --- | --- |
| SMS / voice call code | No | Codes follow the phone number to the attacker. |
| Authenticator app (TOTP) | Yes | Codes are generated on your device; not sent over the network. |
| Push approval app | Mostly | Strong, but watch for "approval fatigue" prompts. |
| Hardware security key (FIDO2/U2F) | Yes | Strongest widely available option; phishing-resistant. |
| Passkey | Yes | Device-bound; resistant to phishing and SMS interception. |

The practical takeaway: wherever a service supports it, move away from SMS and toward an authenticator app, a passkey, or a physical security key. When you are assessing whether an exchange is suitable, check what it allows for login and, just as importantly, for *withdrawals*. A platform that still treats SMS as a primary recovery method leaves a door open no matter how good its other features are. Our [best UK crypto exchange guide for 2026](/blog/best-crypto-exchange-uk-2026) walks through what to look for, and our [Kraken review](/reviews/kraken) and [Bitget review](/reviews/bitget) cover the specific security controls those platforms offer.

## The strongest defence: self-custody with a hardware wallet

True security in crypto means minimising the number of parties you have to trust, including your mobile carrier. The most robust step you can take for meaningful holdings is to move them off exchanges and into self-custody using a hardware wallet.

A hardware wallet such as a [Ledger Nano X](/reviews/ledger-nano-x) or a [Trezor](/reviews/trezor) keeps your private keys on an offline device. Your keys never touch an internet-connected computer or phone. Even if an attacker successfully SIM swaps you, takes over your email, and compromises your laptop, they still cannot move your funds without physically holding the device and knowing its PIN.

This is the practical meaning of the phrase "not your keys, not your crypto." We compare the leading options in detail in our [hardware wallet guide for 2026](/blog/best-hardware-wallet-2026-ledger-vs-trezor), and we explore the broader trade-offs in [self-custody versus custodial wallets](/blog/self-custody-vs-custodial-wallets-2026).

> **Affiliate disclosure:** Some links below are affiliate links. If you buy through them, CryptoWatchdog may earn a commission at no extra cost to you. This never changes our security advice, and we only recommend tools we would use ourselves.

If you decide self-custody is right for you, a hardware wallet is the single most effective way to defeat phone-based account takeovers, because it removes SMS and remote recovery from the equation entirely. You can read our hands-on assessments and, if you choose to buy, support our work via [Trezor](/go/trezor) or [Ledger](/go/ledger). Choose whichever fits your needs after reading the reviews; neither is a "set and forget" solution, and both still require careful handling of your recovery phrase.

Self-custody is not magic. It shifts responsibility onto you. Lose your recovery phrase and no support team can restore your funds. The right model for most people is a deliberate split: keep only what you actively trade on a reputable exchange with strong 2FA, and hold longer-term savings in self-custody. This same "boring but durable" mindset applies across the space, including newer areas such as [tokenised real-world assets like gold, silver, and real estate](/blog/rwa-tokenization-gold-silver-real-estate-2026), where custody questions are just as important as the underlying asset.

## Lock down the exchange side too

If you keep some funds on an exchange for convenience or trading, use every security control it offers:

- **Hardware-key login (FIDO2/U2F)** where supported, instead of SMS.
- **Withdrawal address whitelisting**, so funds can only ever be sent to addresses you pre-approved.
- **Time delays** on changes to security settings or new withdrawal addresses, which add friction an attacker must wait out.
- **Anti-phishing codes**, a personal phrase the exchange includes in genuine emails so you can spot fakes.
- **Login and withdrawal alerts** on a channel the attacker does not control.

These controls do not make an account unbreakable, but they convert a fast, silent theft into a slow, noisy one, giving you time to react.

## What carriers and regulators are doing

You are not entirely on your own. In the United States, the FCC adopted rules in November 2023 requiring wireless providers to use secure customer authentication before transferring a number to a new SIM or carrier, and to notify customers immediately when a SIM change or port-out is requested. You can read the FCC's own summary of the [rules to protect consumers' cell phone accounts](https://www.fcc.gov/document/fcc-adopts-rules-protect-consumers-cell-phone-accounts-0).

These rules are a meaningful improvement, but they are not a guarantee. Social engineering still succeeds against staff, fake IDs still get used in stores, and rules vary by country. Treat regulation as a backstop, not a substitute for your own precautions.

## Action checklist: what to do right now

Do not wait until you see "No Service." Take these steps today.

- **Add a carrier PIN or port-freeze.** Call your mobile provider and set up a verbal password, account PIN, or "port-out lock" that must be provided before any SIM change.
- **Remove SMS as a 2FA method** on every account that allows it, and replace it with an authenticator app, passkey, or hardware key.
- **Create a dedicated crypto email.** Use a unique address only for exchange and wallet accounts, secure it with a hardware key or passkey, and never publish it.
- **Audit your accounts.** List every exchange, wallet, and financial service tied to your phone number, and switch each to stronger 2FA.
- **Move long-term holdings into self-custody** on a hardware wallet, keeping only active funds on exchanges.
- **Enable withdrawal whitelisting and alerts** on every exchange you use.
- **Reduce your data footprint.** Limit what you share publicly about your phone number, finances, and crypto activity.
- **Have a response plan.** Know your carrier's fraud line and how to freeze exchange accounts, so you can act within minutes if your phone goes dark.

## Frequently asked questions

**Can a SIM swap happen even if I still have my physical phone?**

Yes. This is the most misunderstood part of the attack. The criminal does not need your handset. They convince your carrier to move your *number* to a different SIM, after which your phone loses service and their device receives your calls and texts. You may not notice until you try to use your phone.

**Is an authenticator app really safer than SMS?**

For resisting SIM swaps, yes. Authenticator apps generate codes locally on your device using a shared secret, so the codes are never sent over the mobile network and cannot be intercepted by hijacking your number. A hardware security key or passkey is stronger still, because it also resists phishing. No method is perfect, but app- and key-based 2FA close the specific hole that SMS leaves open.

**Will a hardware wallet completely protect me from a SIM swap?**

A hardware wallet protects the assets stored on it, because the private keys stay offline and a transaction cannot be signed without the device and its PIN. That defeats remote theft of self-custodied funds. It does not protect funds you leave on an exchange, and it does not stop the social-engineering and email-takeover parts of an attack. Use it together with strong 2FA and carrier protections, not as your only defence.

**What should I do the moment I suspect a SIM swap?**

Act fast. Contact your mobile carrier from another phone to report the fraud and regain control of your number. Then, from a device you trust, change passwords and lock or freeze your exchange and email accounts, ideally pausing withdrawals. Report the incident to your local cybercrime or fraud authority. In the U.S., complaints can be filed with the FBI's Internet Crime Complaint Center.

**Are exchanges or carriers liable if I lose crypto to a SIM swap?**

This is genuinely uncertain and depends on the facts, the jurisdiction, and the contracts involved. Some victims have pursued carriers in court over negligent identity verification, with mixed outcomes. Crypto's irreversibility makes recovery difficult even when blame is clear. Because liability is not guaranteed, prevention is far more reliable than the hope of compensation afterward.

**Does porting my number to an eSIM make me safer?**

An eSIM does not by itself prevent a SIM swap, because the attack targets your carrier's account controls rather than the physical card. What helps is the account-level protection: a strong carrier PIN, a port-out lock, and breach notifications. Pair those with non-SMS 2FA for the real benefit.

## The bottom line

SIM swapping works because it attacks the recovery paths around your accounts rather than the accounts themselves. The fix is to remove your phone number from the centre of your security: lock down your carrier account, replace SMS codes with app- or key-based 2FA, protect your recovery email, and move serious holdings into self-custody on a hardware wallet.

None of these steps is glamorous, and none is a guarantee on its own. Together, they remove the easy openings that make these attacks so devastating, and that is what separates the people who keep their crypto from the people who become a statistic.

*This article is for general education and is not financial, legal, or security advice. Always do your own research and consider your personal circumstances before acting.*

### Sources

- FBI Internet Crime Complaint Center, [Criminals Increasing SIM Swap Schemes to Steal Millions of Dollars from US Public](https://www.ic3.gov/PSA/2022/PSA220208)
- Federal Communications Commission, [FCC Adopts Rules to Protect Consumers' Cell Phone Accounts](https://www.fcc.gov/document/fcc-adopts-rules-protect-consumers-cell-phone-accounts-0)
- U.S. Department of Justice, [Alabama Man Sentenced for Hack of SEC X Account That Spiked the Value of Bitcoin](https://www.justice.gov/usao-dc/pr/alabama-man-sentenced-hack-sec-x-account-spiked-value-bitcoin)
- The Block, [US Justice Dept. files civil forfeiture complaint for $5 million in bitcoin stolen via SIM swap attacks](https://www.theblock.co/post/370072/us-justice-dept-files-civil-forfeiture-complaint-for-5-million-in-bitcoin-stolen-via-sim-swap-attacks)
