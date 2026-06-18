export interface ExampleSentence {
  sentence: string;
  analysis: {
    components: string[];
    clauses: {
      type: string;
      content: string;
      description: string;
    }[];
    errors: { message: string; suggestion: string }[];
  };
}

export const exampleSentences: ExampleSentence[] = [
  {
    sentence: "Although I had studied hard for the exam, I found that the questions were much more difficult than what I had expected.",
    analysis: {
      components: [
        "主语1: I (在从句中)",
        "谓语1: had studied",
        "主语2: I (在主句中)",
        "谓语2: found",
        "宾语: that从句"
      ],
      clauses: [
        {
          type: "让步状语从句",
          content: "Although I had studied hard for the exam",
          description: "表示让步，说明尽管付出了努力，结果仍与预期不符"
        },
        {
          type: "宾语从句",
          content: "that the questions were much more difficult than what I had expected",
          description: "作为found的宾语，说明发现的内容"
        }
      ],
      errors: [
        {
          message: "句子结构完整，语法正确",
          suggestion: "这是一个复杂但结构良好的句子，包含让步状语从句和宾语从句，表达清晰准确。"
        }
      ]
    }
  },
  {
    sentence: "The book that I borrowed from the library last week, which was recommended by my professor, turned out to be incredibly insightful.",
    analysis: {
      components: [
        "主语: The book (被两个定语从句修饰)",
        "谓语: turned out",
        "表语: to be incredibly insightful"
      ],
      clauses: [
        {
          type: "限制性定语从句",
          content: "that I borrowed from the library last week",
          description: "修饰book，说明是哪本书"
        },
        {
          type: "非限制性定语从句",
          content: "which was recommended by my professor",
          description: "补充说明这本书的额外信息"
        }
      ],
      errors: [
        {
          message: "句子结构完整，使用了两个定语从句修饰主语，语法正确",
          suggestion: "这是一个结构复杂但表达准确的句子，使用了限制性和非限制性定语从句来修饰主语。"
        }
      ]
    }
  },
  {
    sentence: "Not until I arrived at the station did I realize that I had forgotten to bring my passport.",
    analysis: {
      components: [
        "状语: Not until I arrived at the station",
        "谓语: did realize",
        "主���: I",
        "宾语: that从句"
      ],
      clauses: [
        {
          type: "时间状语从句",
          content: "Not until I arrived at the station",
          description: "表示时间，引起句子部分倒装"
        },
        {
          type: "宾语从句",
          content: "that I had forgotten to bring my passport",
          description: "作为realize的宾语，表示意识到的内容"
        }
      ],
      errors: [
        {
          message: "句子使用了部分倒装结构，语法正确",
          suggestion: "这是一个使用部分倒装的句子，Not until引导的时间状语从句放在句首时，主句需要倒装。表达准确。"
        }
      ]
    }
  },
  {
    sentence: "If I were you, I would have approached the problem differently, considering how the situation has evolved.",
    analysis: {
      components: [
        "条件句主语: I",
        "条件句谓语: were",
        "主句主语: I",
        "主句谓语: would have approached",
        "宾语: the problem",
        "方式状语: differently",
        "分词结构: considering..."
      ],
      clauses: [
        {
          type: "虚拟条件句",
          content: "If I were you",
          description: "表示与现实相反的假设"
        }
      ],
      errors: [
        {
          message: "虚拟语气使用正确，句子结构完整",
          suggestion: "这是一个虚拟条件句，使用were表示与现实相反的假设，搭配would have done表示过去未实现的假设。表达准确。"
        }
      ]
    }
  },
  {
    sentence: "What surprised me most was how quickly the technology had advanced since its initial development.",
    analysis: {
      components: [
        "主语: What从句",
        "谓语: was",
        "表语: how从句"
      ],
      clauses: [
        {
          type: "主语从句",
          content: "What surprised me most",
          description: "作为句子主语，引导名词性从句"
        },
        {
          type: "表语从句",
          content: "how quickly the technology had advanced since its initial development",
          description: "作为系动词was的表语，说明令人惊讶的具体内容"
        }
      ],
      errors: [
        {
          message: "句子结构完整，使用了主语从句和表语从句，语法正确",
          suggestion: "这是一个使用了主语从句和表语从句的复杂句，表达清晰准确。"
        }
      ]
    }
  }
];
