function Subject () {
	this.id = '';
	this.name = '';
	this.teacher = '';
	this.room = '';
	this.start = '';
	this.end = '';
	this.startLesson = '';
	this.endLesson = '';

	this.setData = function (pos, data) {
		switch (pos) {
			case 0:
				this.id = data;
				break;
			case 1:
				this.name = data;
				break;
			case 2:
				this.teacher = data;
				break;
			case 3:
				this.room = data;
				break;
			case 4:
				this.start = data;
				break;
			case 5:
				this.end = data;
				break;
			case 6:
				this.startLesson = data;
				break;
			case 7:
				this.endLesson = data;
				break;
		}
	}

	this.toJsonObject = function () {
		var object = {
			id: this.id,
			name: this.name,
			teacher: this.teacher,
			room: this.room,
			start: this.start,
			end: this.end,
			startLesson: this.startLesson,
			endLesson: this.endLesson
		};
		return object;
	}

	return this;
}

module.exports = Subject;