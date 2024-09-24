const request = require("supertest");
const app = require("../../server");
const Quiz = require("../../models/quizSchema");

jest.mock("../../models/quizSchema");

describe("Quiz Routes", () => {
  describe("GET /api/quiz/questions/random", () => {
    it("should return random questions", async () => {
      const mockQuestions = [
        { question: "Question 1", answers: ["A", "B", "C", "D"] },
        { question: "Question 2", answers: ["E", "F", "G", "H"] },
      ];

      Quiz.aggregate.mockResolvedValue(mockQuestions);

      const response = await request(app).get("/api/quiz/questions/random");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].question).toBe("Question 1");
      expect(response.body[1].question).toBe("Question 2");
    });
  });
});
