# Research Papers: Government Software Protection, Critical Infrastructure & Formal Verification

> **Topic:** DoD Anti-Tamper, DARPA Programs (HACMS, CASE), SCADA/ICS Software Integrity Verification, Formal Verification (seL4 Microkernel, CompCert Compiler, EverCrypt, VERDICT), and Government Standards (NIST SP 800-218 SSDF, Common Criteria EAL, FIPS 140, MILS, Software Assurance) | **Papers Found:** 29

---

This bibliography documents 29 foundational and state-of-the-art research papers, defense reports, and government standards on high-assurance software protection, critical infrastructure defense, and mathematically verified software integrity:
1. **Military Software Protection & DoD Anti-Tamper (AT)** (Papers 1–8)
2. **Critical Infrastructure & SCADA / ICS Software Integrity** (Papers 9–15)
3. **Formal Verification of Software Integrity** (Papers 16–22)
4. **Government Standards, Procurement, Common Criteria, & FIPS 140** (Papers 23–29)

---

## I. Military Software Protection & DoD Anti-Tamper (AT)

### 1. The HACMS Program: Using Formal Methods to Eliminate Exploitable Bugs
- **Authors:** Kathleen Fisher, John Launchbury, Raymond Richards
- **Year:** 2017
- **Venue:** *Philosophical Transactions of the Royal Society A: Mathematical, Physical and Engineering Sciences*, Vol. 375, No. 2104
- **DOI / Link:** [https://doi.org/10.1098/rsta.2015.0401](https://doi.org/10.1098/rsta.2015.0401)
- **Summary:** Reports on DARPA's High-Assurance Cyber Military Systems (HACMS) program, which used formal methods and mathematical proofs to construct tamper-resistant, hack-proof software for unmanned defense platforms (quadcopters, autonomous military vehicles). The paper demonstrates how formal verification completely eliminated entire classes of memory safety and control-flow vulnerabilities, surviving exhaustive red-team penetration testing by US military cyber specialists.

### 2. A Survey of Anti-Tamper Technologies
- **Authors:** Eric D. Bryant, Mikhail J. Atallah, Martin R. Stytz
- **Year:** 2004
- **Venue:** *CrossTalk: The Journal of Defense Software Engineering*, Vol. 17, No. 11, pp. 12–16 (also CERIAS Tech Report 2004-55)
- **DOI / Link:** [https://www.cerias.purdue.edu/assets/pdf/bibtex_archive/2004-55.pdf](https://www.cerias.purdue.edu/assets/pdf/bibtex_archive/2004-55.pdf)
- **Summary:** Analyzes state-of-the-art anti-tamper (AT) technologies developed to safeguard Critical Program Information (CPI) in military systems and foreign military sales. The authors evaluate code obfuscation, dynamic self-checking, tamper-resistant packaging, and cryptographic wrappers against adversarial reverse engineering and weapon-system countermeasure development.

### 3. Tamper Resistant Software: An Implementation
- **Authors:** David Aucsmith
- **Year:** 1996
- **Venue:** *First International Workshop on Information Hiding (IH 1996)*, Lecture Notes in Computer Science (LNCS), Vol. 1174, Springer, pp. 317–333
- **DOI / Link:** [https://doi.org/10.1007/3-540-61996-8_52](https://doi.org/10.1007/3-540-61996-8_52)
- **Summary:** Aucsmith's seminal foundation paper establishes the threat model and cryptographic mechanisms required to construct tamper-resistant software operating in untrusted host environments. It introduces self-modifying, interleaved cryptographic blocks with integrity self-verification, creating execution interdependence that prevents unauthorized debugging, modification, and reverse engineering.

### 4. Dynamic Self-Checking Techniques for Improved Tamper Resistance
- **Authors:** William G. Horne, Lesley R. Matheson, Casey Sheehan, Robert Endre Tarjan
- **Year:** 2002
- **Venue:** *ACM Workshop on Security and Privacy in Digital Rights Management (DRM 2001)*, LNCS, Vol. 2320, Springer, pp. 141–159
- **DOI / Link:** [https://doi.org/10.1007/3-540-47870-1_9](https://doi.org/10.1007/3-540-47870-1_9)
- **Summary:** Proposes an automated binary protection framework deploying distributed, overlapping "tester" nodes throughout executable code to verify program integrity in real time. The testers perform dynamic, pseudo-randomized hashing across intersecting memory segments to detect breakpoints, code patches, or memory injection while actively frustrating automated bypass attacks.

### 5. Protecting Software Code by Guards
- **Authors:** Hoi Chang, Mikhail J. Atallah
- **Year:** 2002
- **Venue:** *ACM Workshop on Security and Privacy in Digital Rights Management (DRM 2001)*, LNCS, Vol. 2320, Springer, pp. 160–175
- **DOI / Link:** [https://doi.org/10.1007/3-540-47870-1_10](https://doi.org/10.1007/3-540-47870-1_10)
- **Summary:** Introduces a formal network-of-guards methodology where small, lightweight code snippets ("guards") are embedded within software executables to perform integrity verification, decryption, and defensive actions. By arranging guards into mutually protective, cyclic dependency graphs, the defense ensures that tampering with any single guard or application segment triggers defensive responses across the entire binary.

### 6. Watermarking, Tamper-Proofing, and Obfuscation - Tools for Software Protection
- **Authors:** Christian S. Collberg, Clark Thomborson
- **Year:** 2002
- **Venue:** *IEEE Transactions on Software Engineering (TSE)*, Vol. 28, No. 8, pp. 735–746
- **DOI / Link:** [https://doi.org/10.1109/TSE.2002.1027797](https://doi.org/10.1109/TSE.2002.1027797)
- **Summary:** Provides the foundational theoretical and operational taxonomy for defending intellectual property and sensitive binary code against man-at-the-end (MATE) attackers. The paper formally models the interplay between semantic-preserving obfuscating transformations, dynamic watermarking, and active tamper-proofing mechanisms that force software failure upon modification.

### 7. Design, Implementation, and Automation of a Risk Management Approach for Man-at-the-End Software Protection
- **Authors:** Cataldo Basile, Daniele Canavese, Leonardo Regano, Bjorn De Sutter
- **Year:** 2023
- **Venue:** *Computers & Security*, Vol. 132, Article 103321
- **DOI / Link:** [https://doi.org/10.1016/j.cose.2023.103321](https://doi.org/10.1016/j.cose.2023.103321)
- **Summary:** Formulates an automated risk-management framework to guide the selection and deployment of anti-tamper and obfuscation protections in defense and mission-critical applications. It models the adversarial economics and computational effort required by hostile reverse engineers, automating the placement of layered protections to maximize protection efficacy within tight CPU/memory budgets.

### 8. Evaluation Methodologies in Software Protection Research
- **Authors:** Bjorn De Sutter, Sebastian Schrittwieser, Bart Coppens, Patrick Kochberger
- **Year:** 2024
- **Venue:** *ACM Computing Surveys*, Vol. 57, No. 4, pp. 1–38
- **DOI / Link:** [https://doi.org/10.1145/3702314](https://doi.org/10.1145/3702314)
- **Summary:** Conducts an extensive meta-survey of 571 research papers evaluating software protection and anti-tamper mechanisms under Man-at-the-End (MATE) attack scenarios. It analyzes the rigor of dynamic verification, deobfuscation resistance metrics, and binary tamper-proofing benchmarks, outlining empirical evaluation standards for defense-grade software protection.

---

## II. Critical Infrastructure & SCADA / ICS Software Integrity

### 9. A Review of Cyber Security Risk Assessment Methods for SCADA Systems
- **Authors:** Yulia Cherdantseva, Pete Burnap, Andrew Blyth, Paul Eden, Kevin Jones, Hugh Soulsby, Kristan Stoddart
- **Year:** 2016
- **Venue:** *Computers & Security*, Vol. 56, pp. 1–27
- **DOI / Link:** [https://doi.org/10.1016/j.cose.2015.09.009](https://doi.org/10.1016/j.cose.2015.09.009)
- **Summary:** Surveys risk assessment frameworks and software vulnerability mitigation across national Supervisory Control and Data Acquisition (SCADA) systems and industrial plants. The paper identifies unique architectural constraints in critical infrastructure—such as zero-downtime requirements and legacy firmware vulnerabilities—where traditional IT patching fails and software integrity verification is imperative.

### 10. Research Challenges for the Security of Control Systems
- **Authors:** Alvaro A. Cárdenas, Saurabh Amin, Shankar Sastry
- **Year:** 2008
- **Venue:** *3rd USENIX Workshop on Hot Topics in Security (HotSec '08)*
- **DOI / Link:** [https://www.usenix.org/conference/hotsec-08/research-challenges-security-control-systems](https://www.usenix.org/conference/hotsec-08/research-challenges-security-control-systems)
- **Summary:** Establishes the foundational scientific agenda for defending industrial control systems (ICS) and critical physical infrastructure against software-induced sabotage. The authors demonstrate that classical cybersecurity guarantees (confidentiality, integrity, availability) are insufficient for cyber-physical loops, requiring mathematical models of physical dynamics to verify control-software integrity and detect stealthy manipulations.

### 11. Stuxnet: Dissecting a Cyberwarfare Weapon
- **Authors:** Ralph Langner
- **Year:** 2011
- **Venue:** *IEEE Security & Privacy*, Vol. 9, No. 3, pp. 49–51
- **DOI / Link:** [https://doi.org/10.1109/MSP.2011.67](https://doi.org/10.1109/MSP.2011.67)
- **Summary:** Provides a forensic analysis of the Stuxnet worm, dissecting how it compromised industrial programmable logic controllers (PLCs) by subverting ladder logic code while presenting forged benign telemetry to human operators. Langner highlights the catastrophic risk of unauthorized control-software modification in critical infrastructure, spurring modern research into PLC code attestation and firmware integrity enforcement.

### 12. Detecting Industrial Control Malware Using Automated PLC Code Analytics
- **Authors:** Stephen McLaughlin, Saman Zonouz, Devin Pohly, Patrick McDaniel
- **Year:** 2014
- **Venue:** *IEEE Security & Privacy*, Vol. 12, No. 6, pp. 40–47
- **DOI / Link:** [https://doi.org/10.1109/MSP.2014.113](https://doi.org/10.1109/MSP.2014.113)
- **Summary:** Introduces SABOT, an automated static/dynamic verification system that analyzes PLC bytecode and control program semantics directly against physical plant specifications. By mapping control logic instructions back to safe physical operational envelopes, the system detects malicious modifications and software tampering in industrial control equipment before execution.

### 13. SWATT: SoftWare-Based ATTestation for Embedded Devices
- **Authors:** Arvind Seshadri, Adrian Perrig, Leendert van Doorn, Pradeep K. Khosla
- **Year:** 2004
- **Venue:** *2004 IEEE Symposium on Security and Privacy (S&P '04)*, pp. 272–282
- **DOI / Link:** [https://doi.org/10.1109/SECPRI.2004.1301329](https://doi.org/10.1109/SECPRI.2004.1301329)
- **Summary:** Presents a software-only remote attestation mechanism that enables a verifier to validate the exact memory contents and code integrity of embedded controllers without requiring specialized cryptographic co-processors. Through pseudo-random memory traversals and tight side-channel timing analysis, SWATT guarantees that any modification or rootkit emulation induces detectable execution delays.

### 14. SMART: Secure and Minimal Architecture for (Establishing a Dynamic) Root of Trust
- **Authors:** Karim El Defrawy, Aurélien Francillon, Daniele Perito, Gene Tsudik
- **Year:** 2012
- **Venue:** *19th Annual Network and Distributed System Security Symposium (NDSS 2012)*
- **DOI / Link:** [https://www.ndss-symposium.org/ndss2012/smart-secure-and-minimal-architecture-establishing-dynamic-root-trust/](https://www.ndss-symposium.org/ndss2012/smart-secure-and-minimal-architecture-establishing-dynamic-root-trust/)
- **Summary:** Details SMART, an ultra-lightweight hardware-software co-design providing dynamic root-of-trust and remote attestation for resource-constrained embedded microcontrollers used in critical infrastructure. Requiring only minimal CPU bus modifications, SMART guarantees clean-state attestation and safe code execution even when the resident OS has been fully compromised.

### 15. Assurance Techniques for Industrial Control Systems (ICS)
- **Authors:** William Knowles, Jose M. Such, Antonios Gouglidis, Gaurav Misra, Awais Rashid
- **Year:** 2015
- **Venue:** *Proceedings of the First ACM Workshop on Cyber-Physical Systems-Security and/or PrivaCy (CPS-SPC '15)*, pp. 101–112
- **DOI / Link:** [https://doi.org/10.1145/2808705.2808708](https://doi.org/10.1145/2808705.2808708)
- **Summary:** Formulates the "PASIV" principles, a structured methodology for generating and evaluating security assurance evidence throughout the ICS software development, procurement, and operational lifecycle. The paper maps industrial software assurance activities directly against ISO/IEC 27001 and NIST control families to prevent critical infrastructure disruption.

---

## III. Formal Verification of Software Integrity

### 16. seL4: Formal Verification of an OS Kernel
- **Authors:** Gerwin Klein, Kevin Elphinstone, Gernot Heiser, June Andronick, David Cock, Philip Derrin, Dhammika Elkaduwe, Kai Engelhardt, Rafal Kolanski, Michael Norrish, Thomas Sewell, Harvey Tuch, Simon Winwood
- **Year:** 2009
- **Venue:** *Proceedings of the 22nd ACM Symposium on Operating Systems Principles (SOSP '09)*, pp. 207–220
- **DOI / Link:** [https://doi.org/10.1145/1629575.1629596](https://doi.org/10.1145/1629575.1629596)
- **Summary:** Details the world's first machine-checked formal proof of functional correctness for a general-purpose operating system microkernel. Using the Isabelle/HOL interactive theorem prover, the authors proved that seL4's C implementation satisfies its abstract mathematical specification, ensuring complete absence of buffer overflows, null pointer dereferences, memory leaks, and undefined behavior—establishing the gold standard for high-assurance defense systems.

### 17. Translation Validation for a Verified OS Kernel
- **Authors:** Thomas Sewell, Magnus Myreen, Gerwin Klein
- **Year:** 2013
- **Venue:** *Proceedings of the 34th ACM SIGPLAN Conference on Programming Language Design and Implementation (PLDI '13)*, pp. 471–482
- **DOI / Link:** [https://doi.org/10.1145/2491956.2462183](https://doi.org/10.1145/2491956.2462183)
- **Summary:** Closes the verification gap between source code and machine executable by proving that the compiled ARM binary of the seL4 kernel is a strict refinement of its verified C source code. This machine-checked proof eliminates the compiler from the trusted computing base (TCB), preventing compiler bugs or compiler-injected trojans from undermining system integrity.

### 18. Formal Verification of a Realistic Compiler
- **Authors:** Xavier Leroy
- **Year:** 2009
- **Venue:** *Communications of the ACM (CACM)*, Vol. 52, No. 7, pp. 107–115
- **DOI / Link:** [https://doi.org/10.1145/1538788.1538814](https://doi.org/10.1145/1538788.1538814)
- **Summary:** Outlines the design and formal proof in Coq of CompCert, an optimizing C compiler generating PowerPC, ARM, and x86 assembly code. CompCert mathematically proves semantic preservation between high-level C programs and emitted machine code, ensuring that critical safety/security properties verified at the source level remain strictly preserved in the operational executable.

### 19. Ironclad Apps: End-to-End Security via Automated Full-System Verification
- **Authors:** Chris Hawblitzel, Jon Howell, Jacob R. Lorch, Arjun Narayan, Bryan Parno, Danfeng Zhang, Brian Zill
- **Year:** 2014
- **Venue:** *11th USENIX Symposium on Operating Systems Design and Implementation (OSDI '14)*, pp. 165–181
- **DOI / Link:** [https://www.usenix.org/conference/osdi14/technical-sessions/presentation/hawblitzel](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/hawblitzel)
- **Summary:** Presents the Ironclad architecture, which uses automated theorem provers (Dafny, Z3) to verify that an entire software stack—including drivers, microkernel, crypto libraries, and applications—adheres to high-level security specifications down to assembly instructions. The system uses hardware TPM roots of trust to cryptographically prove to remote clients that untampered, formally verified software executed their request.

### 20. EverCrypt: A Fast, Verified, Cross-Platform Cryptographic Provider
- **Authors:** Jonathan Protzenko, Bryan Parno, Aymeric Fromherz, Chris Hawblitzel, Marina Polubelova, Karthikeyan Bhargavan, Benjamin Beurdouche, Joonwon Choi, Antoine Delignat-Lavaud, Cedric Fournet, Natalia Kulatova, Tahina Ramananandro, Aseem Rastogi, Nikhil Swamy, Christoph M. Wintersteiger, Santiago Zanella-Béguelin
- **Year:** 2020
- **Venue:** *2020 IEEE Symposium on Security and Privacy (S&P '20)*, pp. 1563–1581
- **DOI / Link:** [https://doi.org/10.1109/SP40000.2020.00114](https://doi.org/10.1109/SP40000.2020.00114)
- **Summary:** Developed as part of Project Everest, EverCrypt provides a comprehensive cryptographic library verified end-to-end for memory safety, functional correctness, secret independence (algorithmic constant-time side-channel protection), and architectural equivalence. It proves that military-grade formal verification can yield industrial-grade cryptographic implementations running at top speeds across multiple CPU architectures.

### 21. VERDICT: A Language and Framework for Engineering Cyber Resilient and Safe Systems
- **Authors:** Meng Li, Heber Herencia-Zapana, Saswata Paul, Daniel Prince, Kit Siu, Cristina Eneroth, John Interrante, et al.
- **Year:** 2021
- **Venue:** *Systems*, Vol. 9, No. 1, Article 18
- **DOI / Link:** [https://doi.org/10.3390/systems9010018](https://doi.org/10.3390/systems9010018)
- **Summary:** Developed under the DARPA Cyber Assured Systems Engineering (CASE) program, VERDICT provides an open-source formal modeling and verification framework for mission-critical cyber-physical systems. It integrates formal assume-guarantee contract reasoning (AGREE) and the Kind 2 model checker to verify safety and resilience properties early in the defense system architecture phase.

### 22. Design and Verification of Secure Systems
- **Authors:** John M. Rushby
- **Year:** 1981
- **Venue:** *Proceedings of the Eighth ACM Symposium on Operating Systems Principles (SOSP '81)*, pp. 12–21
- **DOI / Link:** [https://doi.org/10.1145/800216.806587](https://doi.org/10.1145/800216.806587)
- **Summary:** The seminal paper introducing the "separation kernel" concept, originally funded by government defense requirements to guarantee provably secure data isolation. Rushby provides the mathematical formulation showing how a minimal kernel can partition hardware resources so that security proofs can be partitioned and formally verified independently, serving as the grandfather of modern MILS and EAL7 architectures.

---

## IV. Government Standards, Procurement, Common Criteria, & FIPS 140

### 23. NIST SP 800-218: Secure Software Development Framework (SSDF) Version 1.1: Recommendations for Mitigating the Risk of Software Vulnerabilities
- **Authors:** Murugiah Souppaya, Karen Scarfone, Donna Dodson
- **Year:** 2022
- **Venue:** *National Institute of Standards and Technology (NIST) Special Publication*, SP 800-218
- **DOI / Link:** [https://doi.org/10.6028/NIST.SP.800-218](https://doi.org/10.6028/NIST.SP.800-218)
- **Summary:** Codifies the core secure software development practices mandated across the US Federal Government pursuant to Presidential Executive Order 14028. The framework defines requirements across four core groups (Prepare the Organization, Protect the Software, Produce Well-Secured Software, and Respond to Vulnerabilities), establishing procurement benchmarks for software integrity, provenance attestation, and supply-chain verification.

### 24. A Software Assurance Reference Dataset: Thousands of Programs with Known Bugs
- **Authors:** Paul E. Black
- **Year:** 2018
- **Venue:** *Journal of Research of the National Institute of Standards and Technology*, Vol. 123, Article 123005
- **DOI / Link:** [https://doi.org/10.6028/jres.123.005](https://doi.org/10.6028/jres.123.005)
- **Summary:** Presents the NIST Software Assurance Reference Dataset (SARD), a standard benchmark containing over 170,000 programs covering more than 150 Common Weakness Enumeration (CWE) categories. The paper outlines the scientific methodology developed under the NIST Software Assurance Metrics And Tool Evaluation (SAMATE) project to objectively evaluate static analysis and software assurance tools for government procurement.

### 25. Developer-Focused Assurance Requirements
- **Authors:** Gary Stoneburner
- **Year:** 2005
- **Venue:** *IEEE Computer*, Vol. 38, No. 7, pp. 91–93
- **DOI / Link:** [https://doi.org/10.1109/MC.2005.234](https://doi.org/10.1109/MC.2005.234)
- **Summary:** Critically evaluates the Common Criteria (ISO/IEC 15408) Evaluation Assurance Level (EAL) framework from an engineering and software assurance perspective. Stoneburner argues that the traditional EAL paradigm ("more evaluation equals more security") often fails in commercial-off-the-shelf (COTS) and government software procurement, advocating instead for developer-focused lifecycle verification standards.

### 26. The Birth and Death of the Orange Book
- **Authors:** Steven B. Lipner
- **Year:** 2015
- **Venue:** *IEEE Annals of the History of Computing*, Vol. 37, No. 2, pp. 19–31
- **DOI / Link:** [https://doi.org/10.1109/MAHC.2015.27](https://doi.org/10.1109/MAHC.2015.27)
- **Summary:** Written by a pioneer of modern software security, this paper traces the history of the DoD Trusted Computer System Evaluation Criteria (TCSEC / "Orange Book") and its transition into the international Common Criteria standard. Lipner examines why government evaluations historically lagged behind commercial software release cycles and how this spurred modern secure software development lifecycles (SDL) and automated assurance regimes.

### 27. On the Unbearable Lightness of FIPS 140-2 Randomness Tests
- **Authors:** Darren Hurley-Smith, Constantinos Patsakis, Julio Hernandez-Castro
- **Year:** 2022 (Early access 2020)
- **Venue:** *IEEE Transactions on Information Forensics and Security*, Vol. 16, pp. 1199–1212
- **DOI / Link:** [https://doi.org/10.1109/TIFS.2020.2988505](https://doi.org/10.1109/TIFS.2020.2988505)
- **Summary:** Provides an empirical investigation into the cryptographic statistical test battery mandated by the US/Canadian Cryptographic Module Validation Program (CMVP) under FIPS 140-2. The authors demonstrate that the standard tests can fail to detect deliberately biased or backdoored random number generators, proving that passing FIPS 140-2 compliance is an insufficient proxy for software integrity without independent algorithmic verification.

### 28. System Security Assurance: A Systematic Literature Review
- **Authors:** Ankur Shukla, Basel Katt, Livinus Obiora Nweke, Prosper Kandabongee Yeng, Goitom Kahsay Weldehawaryat
- **Year:** 2022
- **Venue:** *Computer Science Review*, Vol. 45, Article 100496
- **DOI / Link:** [https://doi.org/10.1016/j.cosrev.2022.100496](https://doi.org/10.1016/j.cosrev.2022.100496)
- **Summary:** Provides a comprehensive systematic review of modern software security assurance frameworks across the system development lifecycle (SDLC). The survey contrasts descriptive industry models (like BSIMM) against prescriptive security maturity models (like OWASP SAMM and Common Criteria), highlighting how assurance evidence is gathered and validated in security-critical environments.

### 29. The MILS Architecture for High-Assurance Embedded Systems
- **Authors:** Jim Alves-Foss, W. Scott Harrison, Paul Oman, Carol Taylor
- **Year:** 2006
- **Venue:** *International Journal of Embedded Systems*, Vol. 2, Nos. 3/4, pp. 239–247
- **DOI / Link:** [https://doi.org/10.1504/IJES.2006.010534](https://doi.org/10.1504/IJES.2006.010534)
- **Summary:** Outlines the Multiple Independent Levels of Security (MILS) architecture designed for military and avionics systems requiring Common Criteria EAL6/EAL7 certification. The paper explains how MILS uses formal separation kernels to strictly isolate multi-domain software applications (e.g., Unclassified vs. Secret), drastically reducing verification complexity and proof burden for critical national security infrastructure.

---

### Key Synthesis & Research Trends
1. **Convergence of Formal Methods & Anti-Tamper:** High-assurance defense programs (DARPA HACMS, DARPA CASE) have demonstrated that heuristic obfuscation and code-wrapping are increasingly fortified with machine-checked formal proofs (seL4, CompCert, EverCrypt, VERDICT) to provide mathematically provable immunity against exploits and unauthorized tampering.
2. **Shift from Post-Hoc Evaluation to In-Process Assurance:** Research examining Common Criteria (EAL) and DoD Orange Book history demonstrates a global transition toward developer-focused, automated supply chain provenance standards (NIST SP 800-218 SSDF, SBOMs, continuous attestation) over slow bureaucratic post-hoc lab evaluations.
3. **Cyber-Physical & ICS Integrity:** In critical infrastructure (SCADA/ICS), software integrity verification has evolved beyond simple hash checks to include physics-based anomaly detection, control-flow integrity (CFI) for PLCs, and hardware-software minimal roots of trust (SMART, SWATT).
