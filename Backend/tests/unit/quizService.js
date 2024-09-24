const { getRandomQuestions } = require("../../services/quizService");
const Quiz = require("../../models/quizSchema");

jest.mock("../../models/quizSchema");

describe("quizService", () => {
  describe("getRandomQuestions", () => {
    it("should return shuffled questions", async () => {
      const mockQuestions = [
        { question: "Question 1", answers: ["A", "B", "C", "D"] },
        { question: "Question 2", answers: ["E", "F", "G", "H"] },
      ];

      Quiz.aggregate.mockResolvedValue(mockQuestions);

      const result = await getRandomQuestions(2);

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe("Question 1");
      expect(result[1].question).toBe("Question 2");
      expect(result[0].answers).toHaveLength(4);
      expect(result[1].answers).toHaveLength(4);
    });
  });
});
