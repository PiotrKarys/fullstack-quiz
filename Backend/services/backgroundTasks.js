const taskQueue = [];

function addTask(task) {
  taskQueue.push(task);
  if (taskQueue.length === 1) {
    processNextTask();
  }
}

function processNextTask() {
  if (taskQueue.length > 0) {
    const task = taskQueue[0];
    setImmediate(async () => {
      try {
        await task();
      } catch (error) {
        console.error("Błąd podczas wykonywania zadania w tle:", error);
      } finally {
        taskQueue.shift();
        processNextTask();
      }
    });
  }
}

module.exports = { addTask };
