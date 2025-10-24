from sqlalchemy.orm import Session
from src.todos.models import Todo
from src.todos.schemas import TodoCreate, TodoUpdate
from src.todos.exceptions import TodoNotFoundException


class TodoService:
    """Business logic for Todo operations"""

    def __init__(self, db: Session):
        self.db = db

    # -----------------------------
    # CRUD Operations
    # -----------------------------
    def get_todo_by_id(self, todo_id: int) -> Todo:
        todo = self.db.query(Todo).filter(Todo.id == todo_id).first()
        if not todo:
            raise TodoNotFoundException(todo_id)
        return todo

    def create_todo(self, todo_data: TodoCreate) -> Todo:
        db_todo = Todo(
            title=todo_data.title,
            description=todo_data.description,
            is_completed=todo_data.is_completed,
        )
        self.db.add(db_todo)
        self.db.commit()
        self.db.refresh(db_todo)
        return db_todo

    def update_todo(self, todo_id: int, todo_data: TodoUpdate) -> Todo:
        todo = self.get_todo_by_id(todo_id)
        for key, value in todo_data.model_dump(exclude_unset=True).items():
            setattr(todo, key, value)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int):
        todo = self.get_todo_by_id(todo_id)
        self.db.delete(todo)
        self.db.commit()

    # -----------------------------
    # Pagination helpers
    # -----------------------------
    def _paginate_query(self, query, skip: int, limit: int):
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"total": total, "items": items}

    def get_all_todos_paginated(self, skip: int = 0, limit: int = 10):
        query = self.db.query(Todo).order_by(Todo.id.desc())
        return self._paginate_query(query, skip, limit)

    def get_completed_todos_paginated(self, skip: int = 0, limit: int = 10):
        query = self.db.query(Todo).filter(Todo.is_completed == True).order_by(Todo.id.desc())
        return self._paginate_query(query, skip, limit)

    def get_pending_todos_paginated(self, skip: int = 0, limit: int = 10):
        query = self.db.query(Todo).filter(Todo.is_completed == False).order_by(Todo.id.desc())
        return self._paginate_query(query, skip, limit)
